package com.alert.domain.timer

/** 타이머 세션 상태 */
enum class TimerStatus {
    /** 실행 중 */
    RUNNING,
    /** 일시정지 */
    PAUSED,
    /** 완료 (시간 만료) */
    COMPLETED,
    /** 취소 */
    CANCELLED
}
