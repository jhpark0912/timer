package com.alert.domain.activity

import com.alert.domain.task.Task
import com.alert.domain.task.TaskRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime

/** 활동 기록 비즈니스 로직 */
@Service
@Transactional(readOnly = true)
class ActivityLogService(
    private val activityLogRepository: ActivityLogRepository,
    private val taskRepository: TaskRepository
) {

    /** 특정 일자의 활동 기록 조회 */
    fun findByDate(date: LocalDate): List<ActivityLogResponse> {
        val from = date.atStartOfDay()
        val to = date.plusDays(1).atStartOfDay()
        return activityLogRepository.findByDateRange(from, to).map(ActivityLogResponse::from)
    }

    /** 기간별 활동 기록 조회 */
    fun findByDateRange(from: LocalDate, to: LocalDate): List<ActivityLogResponse> {
        val fromDateTime = from.atStartOfDay()
        val toDateTime = to.plusDays(1).atStartOfDay()
        return activityLogRepository.findByDateRange(fromDateTime, toDateTime).map(ActivityLogResponse::from)
    }

    /** 활동 기록 단건 조회 */
    fun findById(id: Long): ActivityLogResponse =
        ActivityLogResponse.from(getLogOrThrow(id))

    /** 수동 활동 기록 생성 */
    @Transactional
    fun create(request: ActivityLogCreateRequest): ActivityLogResponse {
        validateTimeRange(request.startedAt, request.endedAt)

        val task = getTaskOrThrow(request.taskId)
        val durationSeconds = Duration.between(request.startedAt, request.endedAt).seconds

        val log = ActivityLog(
            task = task,
            startedAt = request.startedAt,
            endedAt = request.endedAt,
            durationSeconds = durationSeconds,
            source = ActivitySource.MANUAL,
            memo = request.memo
        )

        val saved = activityLogRepository.save(log)

        // 시간 겹침 확인 (저장은 허용, warning만 포함)
        val warning = checkOverlap(saved.startedAt, saved.endedAt, saved.id)
        return ActivityLogResponse.from(saved, warning)
    }

    /** 타이머 완료 시 ActivityLog 자동 생성 (TimerService에서 호출) */
    @Transactional
    fun createFromTimer(task: Task, startedAt: LocalDateTime, endedAt: LocalDateTime, durationSeconds: Long): ActivityLog {
        val log = ActivityLog(
            task = task,
            startedAt = startedAt,
            endedAt = endedAt,
            durationSeconds = durationSeconds,
            source = ActivitySource.TIMER
        )
        return activityLogRepository.save(log)
    }

    /** 활동 기록 수정 */
    @Transactional
    fun update(id: Long, request: ActivityLogUpdateRequest): ActivityLogResponse {
        val log = getLogOrThrow(id)

        request.taskId?.let { taskId ->
            log.task = getTaskOrThrow(taskId)
        }

        val newStartedAt = request.startedAt ?: log.startedAt
        val newEndedAt = request.endedAt ?: log.endedAt
        validateTimeRange(newStartedAt, newEndedAt)

        if (request.startedAt != null || request.endedAt != null) {
            log.startedAt = newStartedAt
            log.endedAt = newEndedAt
            log.durationSeconds = Duration.between(newStartedAt, newEndedAt).seconds
        }

        request.memo?.let { log.memo = it }

        val warning = checkOverlap(log.startedAt, log.endedAt, log.id)
        return ActivityLogResponse.from(log, warning)
    }

    /** 활동 기록 삭제 */
    @Transactional
    fun delete(id: Long) {
        val log = getLogOrThrow(id)
        activityLogRepository.delete(log)
    }

    /** 시간 범위 유효성 검증 */
    private fun validateTimeRange(startedAt: LocalDateTime, endedAt: LocalDateTime) {
        require(endedAt.isAfter(startedAt)) {
            "종료 시각은 시작 시각보다 이후여야 합니다"
        }
        require(!endedAt.isAfter(LocalDateTime.now())) {
            "종료 시각은 현재 시각 이후일 수 없습니다"
        }
    }

    /** 시간 겹침 확인 후 warning 메시지 반환 */
    private fun checkOverlap(startedAt: LocalDateTime, endedAt: LocalDateTime, excludeId: Long?): String? {
        val overlapCount = activityLogRepository.countOverlapping(startedAt, endedAt, excludeId)
        return if (overlapCount > 0) "기존 기록 ${overlapCount}건과 시간이 겹칩니다" else null
    }

    private fun getLogOrThrow(id: Long): ActivityLog =
        activityLogRepository.findById(id)
            .orElseThrow { NoSuchElementException("존재하지 않는 활동 기록입니다: id=$id") }

    private fun getTaskOrThrow(taskId: Long): Task =
        taskRepository.findById(taskId)
            .orElseThrow { NoSuchElementException("존재하지 않는 항목입니다: id=$taskId") }
}
