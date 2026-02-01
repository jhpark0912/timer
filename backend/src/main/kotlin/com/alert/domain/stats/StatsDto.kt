package com.alert.domain.stats

import java.time.LocalDate

/** 항목별 통계 요약 */
data class TaskStatsItem(
    val taskId: Long,
    val taskName: String,
    val category: String?,
    /** 총 소요 시간 (초) */
    val totalSeconds: Long,
    /** 완료된 세션 수 */
    val sessionCount: Long,
    /** 전체 대비 비율 (%) */
    val percentage: Double
)

/** 일별 시간 추이 데이터 */
data class DailyTrend(
    val date: LocalDate,
    val taskId: Long,
    val taskName: String,
    /** 해당 일자 소요 시간 (초) */
    val totalSeconds: Long
)

/** 통계 조회 응답 */
data class StatsResponse(
    /** 조회 기간 시작일 */
    val from: LocalDate,
    /** 조회 기간 종료일 */
    val to: LocalDate,
    /** 기간 내 전체 소요 시간 (초) */
    val totalSeconds: Long,
    /** 항목별 통계 */
    val taskStats: List<TaskStatsItem>,
    /** 일별 추이 */
    val dailyTrend: List<DailyTrend>
)
