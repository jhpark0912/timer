package com.alert.domain.stats

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

/**
 * 통계 API 컨트롤러
 *
 * 타이머 세션 기록을 기반으로 기간별 항목별 시간 통계를 제공한다.
 *
 * - GET /api/stats?period=daily&date=2026-02-01
 * - GET /api/stats?period=weekly&date=2026-02-01
 * - GET /api/stats?period=monthly&date=2026-02-01
 * - GET /api/stats?from=2026-01-01&to=2026-01-31
 */
@RestController
@RequestMapping("/api/stats")
class StatsController(
    private val statsService: StatsService
) {

    /**
     * 통계 조회
     *
     * period 파라미터 사용 시 date도 함께 전달한다.
     * period 없이 from/to를 직접 지정하면 사용자 지정 기간으로 조회한다.
     */
    @GetMapping
    fun getStats(
        @RequestParam(required = false) period: String?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate?
    ): StatsResponse {
        // 사용자 지정 기간
        if (from != null && to != null) {
            return statsService.getCustom(from, to)
        }

        // 기간별 조회
        val targetDate = date ?: LocalDate.now()
        return when (period?.lowercase()) {
            "daily" -> statsService.getDaily(targetDate)
            "weekly" -> statsService.getWeekly(targetDate)
            "monthly" -> statsService.getMonthly(targetDate)
            else -> statsService.getWeekly(targetDate) // 기본값: 주별
        }
    }
}
