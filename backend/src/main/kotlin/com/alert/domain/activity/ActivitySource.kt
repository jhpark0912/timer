package com.alert.domain.activity

/**
 * 활동 기록 출처
 * 타이머로 자동 생성된 기록과 사용자가 직접 입력한 기록을 구분한다.
 */
enum class ActivitySource {
    /** 타이머로 기록됨 */
    TIMER,
    /** 사용자가 직접 입력함 */
    MANUAL
}
