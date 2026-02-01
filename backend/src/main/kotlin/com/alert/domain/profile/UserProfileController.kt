package com.alert.domain.profile

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/** 사용자 프로필 REST API 컨트롤러 */
@RestController
@RequestMapping("/api")
class UserProfileController(
    private val userProfileService: UserProfileService
) {

    /** 프로필 조회 (미설정 시 204 No Content) */
    @GetMapping("/profile")
    fun getProfile(): ResponseEntity<UserProfileResponse> {
        val profile = userProfileService.getProfile()
            ?: return ResponseEntity.noContent().build()
        return ResponseEntity.ok(profile)
    }

    /** 프로필 생성 또는 수정 */
    @PutMapping("/profile")
    fun saveProfile(@RequestBody request: UserProfileRequest): UserProfileResponse =
        userProfileService.saveProfile(request)
}
