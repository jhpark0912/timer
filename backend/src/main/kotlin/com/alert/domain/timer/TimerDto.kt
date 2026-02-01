package com.alert.domain.timer

import java.time.LocalDateTime

/** 타이머 시작 요청 */
data class TimerStartRequest(
    val taskId: Long,
    /** 설정 시간 (초) */
    val duration: Long
)

/** 타이머 세션 응답 */
data class TimerSessionResponse(
    val id: Long,
    val taskId: Long,
    val taskName: String,
    val duration: Long,
    val elapsed: Long,
    val remaining: Long,
    val status: TimerStatus,
    val startedAt: LocalDateTime,
    val endedAt: LocalDateTime?
) {
    companion object {
        fun from(session: TimerSession, now: LocalDateTime = LocalDateTime.now()): TimerSessionResponse {
            val currentElapsed = session.currentElapsed(now)
            return TimerSessionResponse(
                id = session.id,
                taskId = session.task.id,
                taskName = session.task.name,
                duration = session.duration,
                elapsed = currentElapsed,
                remaining = maxOf(0, session.duration - currentElapsed),
                status = session.status,
                startedAt = session.startedAt,
                endedAt = session.endedAt
            )
        }
    }
}
