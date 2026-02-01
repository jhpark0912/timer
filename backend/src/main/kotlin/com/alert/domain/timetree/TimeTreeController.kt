package com.alert.domain.timetree

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.time.YearMonth

/** 타임 트리 REST API 컨트롤러 */
@RestController
@RequestMapping("/api/timetree")
class TimeTreeController(
    private val timeTreeService: TimeTreeService
) {

    /** 일별 타임 트리 조회 */
    @GetMapping("/daily")
    fun getDaily(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?
    ): DailyTimeTreeResponse {
        return timeTreeService.getDaily(date ?: LocalDate.now())
    }

    /** 주간 타임 트리 조회 */
    @GetMapping("/weekly")
    fun getWeekly(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?
    ): WeeklyTimeTreeResponse {
        return timeTreeService.getWeekly(date ?: LocalDate.now())
    }

    /** 월간 히트맵 조회 */
    @GetMapping("/monthly")
    fun getMonthly(
        @RequestParam(required = false) month: String?
    ): MonthlyTimeTreeResponse {
        val yearMonth = if (month != null) YearMonth.parse(month) else YearMonth.now()
        return timeTreeService.getMonthly(yearMonth)
    }
}
