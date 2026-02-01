package com.alert.domain.task

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

/** 태스크(항목) REST API 컨트롤러 */
@RestController
@RequestMapping("/api")
class TaskController(
    private val taskService: TaskService
) {

    /** 항목 목록 조회 */
    @GetMapping("/tasks")
    fun findAll(): List<TaskResponse> = taskService.findAll()

    /** 항목 단건 조회 */
    @GetMapping("/tasks/{id}")
    fun findById(@PathVariable id: Long): TaskResponse = taskService.findById(id)

    /** 항목 생성 */
    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody request: TaskCreateRequest): TaskResponse =
        taskService.create(request)

    /** 항목 수정 */
    @PutMapping("/tasks/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: TaskUpdateRequest): TaskResponse =
        taskService.update(id, request)

    /** 항목 삭제 */
    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = taskService.delete(id)
}
