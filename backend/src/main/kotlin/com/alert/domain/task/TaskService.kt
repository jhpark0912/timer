package com.alert.domain.task

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/** 태스크 비즈니스 로직 */
@Service
@Transactional(readOnly = true)
class TaskService(
    private val taskRepository: TaskRepository
) {

    /** 전체 태스크 목록 조회 */
    fun findAll(): List<TaskResponse> =
        taskRepository.findAll().map(TaskResponse::from)

    /** 태스크 단건 조회 */
    fun findById(id: Long): TaskResponse =
        TaskResponse.from(getTaskOrThrow(id))

    /** 태스크 생성 */
    @Transactional
    fun create(request: TaskCreateRequest): TaskResponse {
        require(!taskRepository.existsByName(request.name)) {
            "이미 존재하는 항목 이름입니다: ${request.name}"
        }

        val task = Task(
            name = request.name,
            description = request.description,
            colorCode = request.colorCode
        )
        return TaskResponse.from(taskRepository.save(task))
    }

    /** 태스크 수정 */
    @Transactional
    fun update(id: Long, request: TaskUpdateRequest): TaskResponse {
        val task = getTaskOrThrow(id)

        request.name?.let { newName ->
            require(!taskRepository.existsByNameAndIdNot(newName, id)) {
                "이미 존재하는 항목 이름입니다: $newName"
            }
            task.name = newName
        }
        request.description?.let { task.description = it }
        request.colorCode?.let { task.colorCode = it }
        request.isActive?.let { task.isActive = it }
        request.isFavorite?.let { task.isFavorite = it }

        return TaskResponse.from(task)
    }

    /** 태스크 삭제 */
    @Transactional
    fun delete(id: Long) {
        val task = getTaskOrThrow(id)
        taskRepository.delete(task)
    }

    private fun getTaskOrThrow(id: Long): Task =
        taskRepository.findById(id)
            .orElseThrow { NoSuchElementException("존재하지 않는 항목입니다: id=$id") }
}
