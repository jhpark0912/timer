package com.alert.config

import com.alert.domain.activity.ActivityLog
import com.alert.domain.activity.ActivityLogRepository
import com.alert.domain.activity.ActivitySource
import com.alert.domain.task.TaskRepository
import com.alert.domain.timer.TimerSessionRepository
import com.alert.domain.timer.TimerStatus
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * 데이터 마이그레이션 러너
 *
 * 앱 기동 시:
 * 1. tasks 테이블에 color_code 컬럼이 없으면 추가하고, 기존 category의 colorCode를 복사
 * 2. category_id FK 제거 및 categories 테이블 삭제
 * 3. COMPLETED 상태인 TimerSession 중 ActivityLog에 아직 없는 것을 변환
 */
@Component
class DataMigrationRunner(
    private val taskRepository: TaskRepository,
    private val timerSessionRepository: TimerSessionRepository,
    private val activityLogRepository: ActivityLogRepository,
    private val jdbcTemplate: JdbcTemplate
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(DataMigrationRunner::class.java)

    @Transactional
    override fun run(args: ApplicationArguments?) {
        migrateCategoryToTask()
        migrateTimerSessionsToActivityLogs()
    }

    /** STEP 1: 카테고리 colorCode를 Task로 복사 후 카테고리 관련 제거 */
    private fun migrateCategoryToTask() {
        try {
            // categories 테이블이 존재하는지 확인
            val tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'categories'",
                Long::class.java
            ) ?: 0

            if (tableExists > 0) {
                // 기존 task의 category colorCode를 task.color_code로 복사
                val updated = jdbcTemplate.update(
                    """
                    UPDATE tasks t 
                    SET color_code = (SELECT c.color_code FROM categories c WHERE c.id = t.category_id)
                    WHERE t.category_id IS NOT NULL AND t.color_code IS NULL
                    """.trimIndent()
                )
                if (updated > 0) {
                    log.info("{}개 태스크에 카테고리 색상 코드를 복사했습니다", updated)
                }

                // category_id FK 제거
                try {
                    jdbcTemplate.execute(
                        "ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_tasks_category_id"
                    )
                    // FK 이름이 다를 수 있으므로 컬럼도 제거 시도
                    jdbcTemplate.execute(
                        "ALTER TABLE tasks DROP COLUMN IF EXISTS category_id"
                    )
                    log.info("tasks 테이블에서 category_id 컬럼을 제거했습니다")
                } catch (e: Exception) {
                    log.warn("category_id 제거 중 오류 (이미 제거되었을 수 있음): {}", e.message)
                }

                // categories 테이블 삭제
                try {
                    jdbcTemplate.execute("DROP TABLE IF EXISTS categories CASCADE")
                    log.info("categories 테이블을 삭제했습니다")
                } catch (e: Exception) {
                    log.warn("categories 테이블 삭제 중 오류: {}", e.message)
                }
            }
        } catch (e: Exception) {
            log.warn("카테고리 마이그레이션 중 오류 (이미 마이그레이션 완료일 수 있음): {}", e.message)
        }
    }

    /** STEP 2: 완료된 TimerSession을 ActivityLog로 변환 */
    private fun migrateTimerSessionsToActivityLogs() {
        val completedSessions = timerSessionRepository.findByStatus(TimerStatus.COMPLETED)
        if (completedSessions.isEmpty()) return

        // 이미 마이그레이션된 기록 확인 (같은 task + startedAt 조합으로 중복 방지)
        val existingLogs = activityLogRepository.findAll()
        val existingKeys = existingLogs.map { "${it.task.id}_${it.startedAt}" }.toSet()

        var migratedCount = 0
        for (session in completedSessions) {
            val key = "${session.task.id}_${session.startedAt}"
            if (key in existingKeys) continue

            val endedAt = session.endedAt ?: continue

            activityLogRepository.save(
                ActivityLog(
                    task = session.task,
                    startedAt = session.startedAt,
                    endedAt = endedAt,
                    durationSeconds = session.elapsed,
                    source = ActivitySource.TIMER
                )
            )
            migratedCount++
        }

        if (migratedCount > 0) {
            log.info("완료된 TimerSession {}개를 ActivityLog로 마이그레이션 완료", migratedCount)
        }
    }
}
