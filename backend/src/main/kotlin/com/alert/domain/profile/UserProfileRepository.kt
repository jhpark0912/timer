package com.alert.domain.profile

import org.springframework.data.jpa.repository.JpaRepository

/** 사용자 프로필 JPA 리포지토리 */
interface UserProfileRepository : JpaRepository<UserProfile, Long>
