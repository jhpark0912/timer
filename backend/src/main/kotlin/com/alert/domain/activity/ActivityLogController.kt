package com.alert.domain.activity

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

/** 활동 기록 REST API 컨트롤러 */
@RestController
@RequestMapping("/api/activity-logs")
class ActivityLogController(
    private val activityLogService: ActivityLogService
) {

    /**
     * 활동 기록 조회
     * - date 파라미터: 특정 일자 조회
     * - from + to 파라미터: 기간 조회
     */
    @GetMapping
    fun find(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate?
    ): List<ActivityLogResponse> {
        if (from != null && to != null) {
            return activityLogService.findByDateRange(from, to)
        }
        val targetDate = date ?: LocalDate.now()
        return activityLogService.findByDate(targetDate)
    }

    /** 활동 기록 단건 조회 */
    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long): ActivityLogResponse =
        activityLogService.findById(id)

    /** 수동 활동 기록 생성 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody request: ActivityLogCreateRequest): ActivityLogResponse =
        activityLogService.create(request)

    /** 활동 기록 수정 */
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: ActivityLogUpdateRequest): ActivityLogResponse =
        activityLogService.update(id, request)

    /** 활동 기록 삭제 */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = activityLogService.delete(id)
}
