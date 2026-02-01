package com.alert.domain.task

import org.springframework.data.jpa.repository.JpaRepository

/** 태스크 JPA 리포지토리 */
interface TaskRepository : JpaRepository<Task, Long> {

    /** 이름 중복 체크 */
    fun existsByName(name: String): Boolean

    /** 이름 중복 체크 (자기 자신 제외, 수정 시 사용) */
    fun existsByNameAndIdNot(name: String, id: Long): Boolean
}
