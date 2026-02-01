package com.alert.domain.timetree

import com.alert.domain.activity.ActivityLog
import com.alert.domain.activity.ActivityLogRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.TemporalAdjusters

/**
 * 타임 트리 서비스
 *
 * ActivityLog를 기반으로 일별/주간/월간 타임 트리 데이터를 생성한다.
 */
@Service
@Transactional(readOnly = true)
class TimeTreeService(
    private val activityLogRepository: ActivityLogRepository
) {

    /** 일별 타임 트리 조회 */
    fun getDaily(date: LocalDate): DailyTimeTreeResponse {
        val from = date.atStartOfDay()
        val to = date.plusDays(1).atStartOfDay()
        val logs = activityLogRepository.findByDateRange(from, to)

        return buildDailyResponse(date, logs)
    }

    /** 주간 타임 트리 조회 (해당 날짜가 포함된 월~일) */
    fun getWeekly(date: LocalDate): WeeklyTimeTreeResponse {
        val monday = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        val sunday = date.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
        val from = monday.atStartOfDay()
        val to = sunday.plusDays(1).atStartOfDay()

        val logs = activityLogRepository.findByDateRange(from, to)
        val logsByDate = logs.groupBy { it.startedAt.toLocalDate() }

        val days = (0L..6L).map { offset ->
            val d = monday.plusDays(offset)
            val dayLogs = logsByDate[d] ?: emptyList()
            WeeklyDayEntry(
                date = d,
                blocks = dayLogs.map(TimeTreeBlock::from),
                totalSeconds = dayLogs.sumOf { it.durationSeconds }
            )
        }

        return WeeklyTimeTreeResponse(
            weekStart = monday,
            weekEnd = sunday,
            days = days
        )
    }

    /** 월간 히트맵 조회 */
    fun getMonthly(yearMonth: YearMonth): MonthlyTimeTreeResponse {
        val firstDay = yearMonth.atDay(1)
        val lastDay = yearMonth.atEndOfMonth()
        val from = firstDay.atStartOfDay()
        val to = lastDay.plusDays(1).atStartOfDay()

        val logs = activityLogRepository.findByDateRange(from, to)
        val logsByDate = logs.groupBy { it.startedAt.toLocalDate() }

        val days = (1..yearMonth.lengthOfMonth()).map { day ->
            val d = yearMonth.atDay(day)
            val dayLogs = logsByDate[d] ?: emptyList()
            val taskBreakdown = dayLogs.groupBy { it.task }
                .map { (task, taskLogs) ->
                    MonthlyTaskBreakdown(
                        taskId = task.id,
                        taskName = task.name,
                        colorCode = task.colorCode,
                        totalSeconds = taskLogs.sumOf { it.durationSeconds }
                    )
                }
                .sortedByDescending { it.totalSeconds }
            MonthlyDayEntry(
                date = d,
                totalSeconds = dayLogs.sumOf { it.durationSeconds },
                taskBreakdown = taskBreakdown
            )
        }

        return MonthlyTimeTreeResponse(
            month = yearMonth.toString(),
            days = days
        )
    }

    /** 일별 응답 조립 (블록 + 요약) */
    private fun buildDailyResponse(date: LocalDate, logs: List<ActivityLog>): DailyTimeTreeResponse {
        val blocks = logs.map(TimeTreeBlock::from)
        val totalSeconds = logs.sumOf { it.durationSeconds }

        return DailyTimeTreeResponse(
            date = date,
            blocks = blocks,
            summary = DailySummary(
                totalSeconds = totalSeconds
            )
        )
    }
}
