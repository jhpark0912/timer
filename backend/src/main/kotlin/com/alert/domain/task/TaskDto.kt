package com.alert.domain.task

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

/** 태스크 생성 요청 */
data class TaskCreateRequest(
    val name: String,
    val description: String? = null,
    val colorCode: String? = null
)

/** 태스크 수정 요청 */
data class TaskUpdateRequest(
    val name: String? = null,
    val description: String? = null,
    val colorCode: String? = null,
    val isActive: Boolean? = null,
    val isFavorite: Boolean? = null
)

/** 태스크 응답 */
data class TaskResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val colorCode: String?,
    @get:JsonProperty("isActive")
    val isActive: Boolean,
    @get:JsonProperty("isFavorite")
    val isFavorite: Boolean,
    val dateCreated: LocalDateTime,
    val dateUpdated: LocalDateTime
) {
    companion object {
        fun from(task: Task) = TaskResponse(
            id = task.id,
            name = task.name,
            description = task.description,
            colorCode = task.colorCode,
            isActive = task.isActive,
            isFavorite = task.isFavorite,
            dateCreated = task.dateCreated,
            dateUpdated = task.dateUpdated
        )
    }
}
