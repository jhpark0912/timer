package com.alert.domain.timer

import com.alert.domain.activity.ActivityLogService
import com.alert.domain.task.TaskRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

/** 타이머 비즈니스 로직 */
@Service
@Transactional(readOnly = true)
class TimerService(
    private val timerSessionRepository: TimerSessionRepository,
    private val taskRepository: TaskRepository,
    private val activityLogService: ActivityLogService
) {

    /** 현재 활성(RUNNING 또는 PAUSED) 타이머 세션 조회 */
    fun getActiveSession(): TimerSessionResponse? {
        val running = timerSessionRepository.findByStatus(TimerStatus.RUNNING)
        if (running.isNotEmpty()) return TimerSessionResponse.from(running.first())

        val paused = timerSessionRepository.findByStatus(TimerStatus.PAUSED)
        if (paused.isNotEmpty()) return TimerSessionResponse.from(paused.first())

        return null
    }

    /**
     * 타이머 시작
     * - 이미 실행 중인 타이머가 있으면 자동 일시정지
     * - 새 타이머 세션 생성
     */
    @Transactional
    fun start(request: TimerStartRequest): TimerSessionResponse {
        val task = taskRepository.findById(request.taskId)
            .orElseThrow { NoSuchElementException("존재하지 않는 항목입니다: id=${request.taskId}") }

        require(request.duration > 0) { "타이머 시간은 0보다 커야 합니다" }

        val now = LocalDateTime.now()

        // 현재 실행 중인 타이머가 있으면 자동 일시정지
        timerSessionRepository.findByStatus(TimerStatus.RUNNING).forEach { session ->
            session.pause(now)
        }

        val session = TimerSession(
            task = task,
            duration = request.duration,
            startedAt = now,
            lastResumedAt = now
        )
        return TimerSessionResponse.from(timerSessionRepository.save(session), now)
    }

    /** 타이머 일시정지 */
    @Transactional
    fun pause(sessionId: Long): TimerSessionResponse {
        val session = getSessionOrThrow(sessionId)
        session.pause()
        return TimerSessionResponse.from(session)
    }

    /** 타이머 재개 */
    @Transactional
    fun resume(sessionId: Long): TimerSessionResponse {
        val session = getSessionOrThrow(sessionId)

        val now = LocalDateTime.now()

        // 다른 실행 중인 타이머가 있으면 자동 일시정지
        timerSessionRepository.findByStatus(TimerStatus.RUNNING).forEach { running ->
            if (running.id != sessionId) running.pause(now)
        }

        session.resume(now)
        return TimerSessionResponse.from(session, now)
    }

    /**
     * 타이머 종료 (완료 또는 취소)
     * 완료(COMPLETED) 시 ActivityLog를 자동 생성한다.
     */
    @Transactional
    fun stop(sessionId: Long, completed: Boolean = true): TimerSessionResponse {
        val session = getSessionOrThrow(sessionId)
        val now = LocalDateTime.now()
        val status = if (completed) TimerStatus.COMPLETED else TimerStatus.CANCELLED
        session.stop(status, now)

        // 완료 시 ActivityLog 자동 생성
        if (completed) {
            activityLogService.createFromTimer(
                task = session.task,
                startedAt = session.startedAt,
                endedAt = now,
                durationSeconds = session.elapsed
            )
        }

        return TimerSessionResponse.from(session, now)
    }

    private fun getSessionOrThrow(id: Long): TimerSession =
        timerSessionRepository.findById(id)
            .orElseThrow { NoSuchElementException("존재하지 않는 타이머 세션입니다: id=$id") }
}
