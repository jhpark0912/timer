package com.alert

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

/** 타이머 기반 일정관리 시스템 메인 애플리케이션 */
@SpringBootApplication
@EnableJpaAuditing
class AlertApplication

fun main(args: Array<String>) {
    runApplication<AlertApplication>(*args)
}
