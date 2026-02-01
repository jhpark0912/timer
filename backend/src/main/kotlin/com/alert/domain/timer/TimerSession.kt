package com.alert.domain.timer

import com.alert.domain.BaseEntity
import com.alert.domain.task.Task
import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 타이머 세션 엔티티
 * 각 타이머 실행 기록을 저장
 */
@Entity
@Table(name = "timer_sessions")
class TimerSession(

    /** 연결된 태스크 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    val task: Task,

    /** 설정된 시간 (초) */
    @Column(nullable = false)
    val duration: Long,

    /** 실제 경과 시간 (초) */
    @Column(nullable = false)
    var elapsed: Long = 0,

    /** 시작 시각 */
    @Column(name = "started_at", nullable = false)
    val startedAt: LocalDateTime = LocalDateTime.now(),

    /** 종료 시각 */
    @Column(name = "ended_at")
    var endedAt: LocalDateTime? = null,

    /** 타이머 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: TimerStatus = TimerStatus.RUNNING,

    /** 마지막 재개 시각 (경과 시간 계산용) */
    @Column(name = "last_resumed_at")
    var lastResumedAt: LocalDateTime = LocalDateTime.now(),

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0
) : BaseEntity() {

    /** 일시정지 처리: 경과 시간 누적 후 상태 변경 */
    fun pause(now: LocalDateTime = LocalDateTime.now()) {
        check(status == TimerStatus.RUNNING) { "실행 중인 타이머만 일시정지할 수 있습니다" }
        elapsed += java.time.Duration.between(lastResumedAt, now).seconds
        status = TimerStatus.PAUSED
    }

    /** 재개 처리 */
    fun resume(now: LocalDateTime = LocalDateTime.now()) {
        check(status == TimerStatus.PAUSED) { "일시정지 상태인 타이머만 재개할 수 있습니다" }
        lastResumedAt = now
        status = TimerStatus.RUNNING
    }

    /** 종료 처리: 경과 시간 최종 계산 */
    fun stop(completedStatus: TimerStatus, now: LocalDateTime = LocalDateTime.now()) {
        if (status == TimerStatus.RUNNING) {
            elapsed += java.time.Duration.between(lastResumedAt, now).seconds
        }
        status = completedStatus
        endedAt = now
    }

    /** 현재까지의 총 경과 시간 계산 (초) */
    fun currentElapsed(now: LocalDateTime = LocalDateTime.now()): Long {
        return if (status == TimerStatus.RUNNING) {
            elapsed + java.time.Duration.between(lastResumedAt, now).seconds
        } else {
            elapsed
        }
    }
}
