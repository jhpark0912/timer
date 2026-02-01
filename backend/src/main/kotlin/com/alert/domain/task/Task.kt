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

    /** 색상 코드 (예: #FF5733) */
    @Column(name = "color_code", length = 7)
    var colorCode: String? = null,

    /** 활성/비활성 상태 */
    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    /** 즐겨찾기 여부 */
    @Column(name = "is_favorite", nullable = false)
    var isFavorite: Boolean = false,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0
) : BaseEntity()
