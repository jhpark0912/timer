package com.alert.domain.activity

import com.alert.domain.BaseEntity
import com.alert.domain.task.Task
import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 활동 기록 통합 엔티티
 * 타이머로 측정된 기록과 사용자가 직접 입력한 기록을 모두 저장한다.
 * source 필드로 기록 출처를 구분한다.
 */
@Entity
@Table(name = "activity_logs")
class ActivityLog(

    /** 연결된 항목 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    var task: Task,

    /** 활동 시작 시각 */
    @Column(name = "started_at", nullable = false)
    var startedAt: LocalDateTime,

    /** 활동 종료 시각 */
    @Column(name = "ended_at", nullable = false)
    var endedAt: LocalDateTime,

    /** 경과 시간 (초 단위) */
    @Column(name = "duration_seconds", nullable = false)
    var durationSeconds: Long,

    /** 기록 출처: TIMER 또는 MANUAL */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var source: ActivitySource,

    /** 메모 (선택, 주로 수동 입력 시 활용) */
    @Column(columnDefinition = "TEXT")
    var memo: String? = null,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0
) : BaseEntity()
