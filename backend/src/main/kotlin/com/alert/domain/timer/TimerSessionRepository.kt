package com.alert.domain.timer

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

/** 타이머 세션 JPA 리포지토리 */
interface TimerSessionRepository : JpaRepository<TimerSession, Long> {

    /** 현재 실행 중인 타이머 세션 조회 (한 시점에 하나만 존재해야 함) */
    fun findByStatus(status: TimerStatus): List<TimerSession>

    /** 특정 태스크의 세션 목록 조회 */
    fun findByTaskId(taskId: Long): List<TimerSession>

    /** 기간 내 완료된 세션 조회 (통계 집계용) */
    @Query(
        """
        SELECT s FROM TimerSession s JOIN FETCH s.task
        WHERE s.status = 'COMPLETED'
          AND s.endedAt >= :from
          AND s.endedAt < :to
        ORDER BY s.endedAt
        """
    )
    fun findCompletedSessionsBetween(from: LocalDateTime, to: LocalDateTime): List<TimerSession>
}
