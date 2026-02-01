package com.alert.domain.stats

import com.alert.domain.timer.TimerSession
import com.alert.domain.timer.TimerSessionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

/**
 * 통계 서비스
 *
 * 완료된 타이머 세션을 기반으로 항목별·기간별 시간 통계를 집계한다.
 */
@Service
@Transactional(readOnly = true)
class StatsService(
    private val sessionRepository: TimerSessionRepository
) {

    /** 일별 통계 조회 */
    fun getDaily(date: LocalDate): StatsResponse {
        return buildStats(date, date)
    }

    /** 주별 통계 조회 (해당 날짜가 포함된 월~일 기간) */
    fun getWeekly(date: LocalDate): StatsResponse {
        val monday = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        val sunday = date.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
        return buildStats(monday, sunday)
    }

    /** 월별 통계 조회 */
    fun getMonthly(date: LocalDate): StatsResponse {
        val firstDay = date.withDayOfMonth(1)
        val lastDay = date.with(TemporalAdjusters.lastDayOfMonth())
        return buildStats(firstDay, lastDay)
    }

    /** 사용자 지정 기간 통계 조회 */
    fun getCustom(from: LocalDate, to: LocalDate): StatsResponse {
        require(!from.isAfter(to)) { "시작일은 종료일보다 이후일 수 없습니다" }
        return buildStats(from, to)
    }

    /**
     * 통계 집계 핵심 로직
     *
     * 완료된 세션의 endedAt 기준으로 기간 필터링하고,
     * 항목별 소요시간 합계·비율·일별 추이를 계산한다.
     */
    private fun buildStats(from: LocalDate, to: LocalDate): StatsResponse {
        val fromDateTime = from.atStartOfDay()
        val toDateTime = to.plusDays(1).atStartOfDay() // to 날짜 포함 위해 +1일

        val sessions = sessionRepository.findCompletedSessionsBetween(fromDateTime, toDateTime)

        val grandTotal = sessions.sumOf { it.elapsed }

        // 항목별 집계
        val taskStats = sessions
            .groupBy { it.task.id }
            .map { (_, group) ->
                val first = group.first()
                val total = group.sumOf { it.elapsed }
                TaskStatsItem(
                    taskId = first.task.id,
                    taskName = first.task.name,
                    category = first.task.category,
                    totalSeconds = total,
                    sessionCount = group.size.toLong(),
                    percentage = if (grandTotal > 0) (total.toDouble() / grandTotal * 100) else 0.0
                )
            }
            .sortedByDescending { it.totalSeconds }

        // 일별 추이
        val dailyTrend = sessions
            .groupBy { Pair(it.endedAt!!.toLocalDate(), it.task.id) }
            .map { (key, group) ->
                val (date, _) = key
                val first = group.first()
                DailyTrend(
                    date = date,
                    taskId = first.task.id,
                    taskName = first.task.name,
                    totalSeconds = group.sumOf { it.elapsed }
                )
            }
            .sortedWith(compareBy({ it.date }, { it.taskName }))

        return StatsResponse(
            from = from,
            to = to,
            totalSeconds = grandTotal,
            taskStats = taskStats,
            dailyTrend = dailyTrend
        )
    }
}
