package com.alert.domain.profile

import com.alert.domain.BaseEntity
import jakarta.persistence.*

/**
 * 사용자 프로필 엔티티
 * 단일 사용자 시스템이므로 레코드는 1개만 유지
 */
@Entity
@Table(name = "user_profiles")
class UserProfile(

    /** 사용자 이름 또는 닉네임 */
    @Column(nullable = false, length = 50)
    var nickname: String,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0
) : BaseEntity()
