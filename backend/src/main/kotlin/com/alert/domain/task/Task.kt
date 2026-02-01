package com.alert.domain.task

import com.alert.domain.BaseEntity
import jakarta.persistence.*

/**
 * 태스크(항목) 엔티티
 * 사용자가 타이머를 적용할 항목을 나타냄
 */
@Entity
@Table(name = "tasks")
class Task(

    /** 항목 이름 (필수, 중복 불가) */
    @Column(nullable = false, unique = true)
    var name: String,

    /** 항목 설명 (선택) */
    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    /** 카테고리 또는 태그 (선택, 통계 그룹핑 용도) */
    var category: String? = null,

    /** 활성/비활성 상태 */
    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0
) : BaseEntity()
