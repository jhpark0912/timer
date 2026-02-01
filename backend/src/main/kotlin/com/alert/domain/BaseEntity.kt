package com.alert.domain

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

/**
 * 공통 엔티티 - 생성일시/수정일시 자동 관리
 * date_created, date_updated 컬럼이 있는 엔티티는 이 클래스를 상속
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class BaseEntity {

    @CreatedDate
    @Column(name = "date_created", nullable = false, updatable = false)
    var dateCreated: LocalDateTime = LocalDateTime.now()
        protected set

    @LastModifiedDate
    @Column(name = "date_updated", nullable = false)
    var dateUpdated: LocalDateTime = LocalDateTime.now()
        protected set
}
