package com.alert.domain.profile

import java.time.LocalDateTime

/** 프로필 생성/수정 요청 */
data class UserProfileRequest(
    val nickname: String
)

/** 프로필 응답 */
data class UserProfileResponse(
    val id: Long,
    val nickname: String,
    val dateCreated: LocalDateTime,
    val dateUpdated: LocalDateTime
) {
    companion object {
        fun from(profile: UserProfile) = UserProfileResponse(
            id = profile.id,
            nickname = profile.nickname,
            dateCreated = profile.dateCreated,
            dateUpdated = profile.dateUpdated
        )
    }
}
