package com.alert.domain.profile

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * 사용자 프로필 비즈니스 로직
 * 단일 사용자 시스템: 프로필은 최대 1개만 존재
 */
@Service
@Transactional(readOnly = true)
class UserProfileService(
    private val userProfileRepository: UserProfileRepository
) {

    /** 프로필 조회 (없으면 null) */
    fun getProfile(): UserProfileResponse? =
        userProfileRepository.findAll().firstOrNull()?.let(UserProfileResponse::from)

    /** 프로필 생성 또는 수정 */
    @Transactional
    fun saveProfile(request: UserProfileRequest): UserProfileResponse {
        val trimmed = request.nickname.trim()
        require(trimmed.isNotBlank()) { "닉네임은 비어있을 수 없습니다." }
        require(trimmed.length <= 50) { "닉네임은 50자 이하여야 합니다." }

        val existing = userProfileRepository.findAll().firstOrNull()
        val profile = if (existing != null) {
            existing.nickname = trimmed
            existing
        } else {
            userProfileRepository.save(UserProfile(nickname = trimmed))
        }

        return UserProfileResponse.from(profile)
    }
}
