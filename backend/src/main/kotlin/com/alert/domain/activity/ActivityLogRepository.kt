package com.alert.domain.activity

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

/** 활동 기록 JPA 리포지토리 */
interface ActivityLogRepository : JpaRepository<ActivityLog, Long> {

    /** 특정 일자의 활동 기록 조회 (시작 시각 기준) */
    @Query(
        """
        SELECT a FROM ActivityLog a JOIN FETCH a.task t
        WHERE a.startedAt >= :from AND a.startedAt < :to
        ORDER BY a.startedAt
        """
    )
    fun findByDateRange(from: LocalDateTime, to: LocalDateTime): List<ActivityLog>

    /** 기간 내 활동 기록 조회 (통계 집계용, endedAt 기준) */
    @Query(
        """
        SELECT a FROM ActivityLog a JOIN FETCH a.task t
        WHERE a.endedAt >= :from AND a.endedAt < :to
        ORDER BY a.endedAt
        """
    )
    fun findByEndedAtBetween(from: LocalDateTime, to: LocalDateTime): List<ActivityLog>

    /** 시간 겹침 확인: 특정 기간과 겹치는 기록이 있는지 (자기 자신 제외) */
    @Query(
        """
        SELECT COUNT(a) FROM ActivityLog a
        WHERE a.startedAt < :endedAt AND a.endedAt > :startedAt
          AND (:excludeId IS NULL OR a.id <> :excludeId)
        """
    )
    fun countOverlapping(startedAt: LocalDateTime, endedAt: LocalDateTime, excludeId: Long?): Long
}
