package com.alert.domain.task

import java.time.LocalDateTime

/** 태스크 생성 요청 */
data class TaskCreateRequest(
    val name: String,
    val description: String? = null,
    val category: String? = null
)

/** 태스크 수정 요청 */
data class TaskUpdateRequest(
    val name: String? = null,
    val description: String? = null,
    val category: String? = null,
    val isActive: Boolean? = null
)

/** 태스크 응답 */
data class TaskResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val category: String?,
    val isActive: Boolean,
    val dateCreated: LocalDateTime,
    val dateUpdated: LocalDateTime
) {
    companion object {
        fun from(task: Task) = TaskResponse(
            id = task.id,
            name = task.name,
            description = task.description,
            category = task.category,
            isActive = task.isActive,
            dateCreated = task.dateCreated,
            dateUpdated = task.dateUpdated
        )
    }
}
