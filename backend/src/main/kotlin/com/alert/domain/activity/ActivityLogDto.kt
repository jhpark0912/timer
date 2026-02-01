package com.alert.domain.activity

import java.time.LocalDateTime

/** 수동 활동 기록 생성 요청 */
data class ActivityLogCreateRequest(
    val taskId: Long,
    val startedAt: LocalDateTime,
    val endedAt: LocalDateTime,
    val memo: String? = null
)

/** 활동 기록 수정 요청 */
data class ActivityLogUpdateRequest(
    val taskId: Long? = null,
    val startedAt: LocalDateTime? = null,
    val endedAt: LocalDateTime? = null,
    val memo: String? = null
)

/** 활동 기록 응답 */
data class ActivityLogResponse(
    val id: Long,
    val taskId: Long,
    val taskName: String,
    val colorCode: String?,
    val startedAt: LocalDateTime,
    val endedAt: LocalDateTime,
    val durationSeconds: Long,
    val source: ActivitySource,
    val memo: String?,
    /** 기존 기록과 시간 겹침이 있을 경우 경고 메시지 */
    val warning: String? = null,
    val dateCreated: LocalDateTime,
    val dateUpdated: LocalDateTime
) {
    companion object {
        fun from(log: ActivityLog, warning: String? = null) = ActivityLogResponse(
            id = log.id,
            taskId = log.task.id,
            taskName = log.task.name,
            colorCode = log.task.colorCode,
            startedAt = log.startedAt,
            endedAt = log.endedAt,
            durationSeconds = log.durationSeconds,
            source = log.source,
            memo = log.memo,
            warning = warning,
            dateCreated = log.dateCreated,
            dateUpdated = log.dateUpdated
        )
    }
}
