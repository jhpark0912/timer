package com.alert.domain.timetree

import com.alert.domain.activity.ActivityLog
import com.alert.domain.activity.ActivitySource
import java.time.LocalDate
import java.time.LocalDateTime

/** 타임 트리 블록 (개별 활동 기록) */
data class TimeTreeBlock(
    val activityLogId: Long,
    val taskId: Long,
    val taskName: String,
    val colorCode: String?,
    val startedAt: LocalDateTime,
    val endedAt: LocalDateTime,
    val durationSeconds: Long,
    val source: ActivitySource,
    val memo: String?
) {
    companion object {
        fun from(log: ActivityLog) = TimeTreeBlock(
            activityLogId = log.id,
            taskId = log.task.id,
            taskName = log.task.name,
            colorCode = log.task.colorCode,
            startedAt = log.startedAt,
            endedAt = log.endedAt,
            durationSeconds = log.durationSeconds,
            source = log.source,
            memo = log.memo
        )
    }
}

/** 일별 타임 트리 응답 */
data class DailyTimeTreeResponse(
    val date: LocalDate,
    val blocks: List<TimeTreeBlock>,
    val summary: DailySummary
)

/** 일별 요약 */
data class DailySummary(
    val totalSeconds: Long
)

/** 주간 타임 트리 응답 */
data class WeeklyTimeTreeResponse(
    val weekStart: LocalDate,
    val weekEnd: LocalDate,
    val days: List<WeeklyDayEntry>
)

/** 주간 타임 트리 - 일별 엔트리 */
data class WeeklyDayEntry(
    val date: LocalDate,
    val blocks: List<TimeTreeBlock>,
    val totalSeconds: Long
)

/** 월간 히트맵 응답 */
data class MonthlyTimeTreeResponse(
    val month: String,
    val days: List<MonthlyDayEntry>
)

/** 월간 히트맵 - 일별 엔트리 */
data class MonthlyDayEntry(
    val date: LocalDate,
    val totalSeconds: Long,
    val taskBreakdown: List<MonthlyTaskBreakdown>
)

/** 월간 히트맵 - 태스크별 비율 데이터 */
data class MonthlyTaskBreakdown(
    val taskId: Long,
    val taskName: String,
    val colorCode: String?,
    val totalSeconds: Long
)
