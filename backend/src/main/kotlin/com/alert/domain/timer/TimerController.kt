package com.alert.domain.timer

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

/** 타이머 제어 REST API 컨트롤러 */
@RestController
@RequestMapping("/api/timer")
class TimerController(
    private val timerService: TimerService
) {

    /** 현재 활성 타이머 세션 조회 */
    @GetMapping("/active")
    fun getActiveSession(): TimerSessionResponse? = timerService.getActiveSession()

    /** 타이머 시작 */
    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    fun start(@RequestBody request: TimerStartRequest): TimerSessionResponse =
        timerService.start(request)

    /** 타이머 일시정지 */
    @PostMapping("/{sessionId}/pause")
    fun pause(@PathVariable sessionId: Long): TimerSessionResponse =
        timerService.pause(sessionId)

    /** 타이머 재개 */
    @PostMapping("/{sessionId}/resume")
    fun resume(@PathVariable sessionId: Long): TimerSessionResponse =
        timerService.resume(sessionId)

    /** 타이머 종료 */
    @PostMapping("/{sessionId}/stop")
    fun stop(
        @PathVariable sessionId: Long,
        @RequestParam(defaultValue = "true") completed: Boolean
    ): TimerSessionResponse = timerService.stop(sessionId, completed)
}
