# IMPLEMENTATION PRD: 스케줄 기반 일정관리 시스템 v2.0 추가 구현

> **목적:** 이 문서는 Claude Code가 기존 v1 구현 위에 v2.0 기능을 추가 구현하기 위한 작업 명세서이다.  
> **전제:** v1(타이머 기반 태스크 관리, Docker 환경, 기본 CRUD, 타이머 동작)은 이미 구현 완료된 상태이다.

---

## 현재 완료된 상태 (v1 기준)

### 이미 존재하는 것

- Docker Compose 환경 (frontend + backend + PostgreSQL)
- Task 엔티티 CRUD (생성, 조회, 수정, 삭제)
- 타이머 기본 기능 (시작, 일시정지, 재개, 종료)
- TimerSession 기록 저장
- 기본 통계 API (기간별 합계)
- 알림 기능 (Notification API + Service Worker + 백그라운드 탭 지원)
- React 프론트엔드 기본 화면

### 변경이 필요한 것 (v2.0)

1. 시스템 상위 구조를 "스케줄 관리"로 전환
2. Category 엔티티 신규 추가, Task가 Category 하위로 이동
3. ActivityLog 통합 테이블 신규 추가
4. 수동 활동 기록 입력 기능
5. 타임 트리 기능 (일별/주간/월간)
6. 통계 화면에 타임 트리 연동
7. 프론트엔드 화면 구조 재편

---

## 구현 규칙

### 공통

- Kotlin 코드에는 반드시 **한국어 주석**을 작성한다 (클래스, 메서드, 주요 로직 단위)
- 모킹 데이터를 절대 사용하지 않는다. 모든 데이터는 실제 DB에서 읽고 쓴다
- 기존 v1 코드를 최대한 유지하면서 확장한다. 불필요한 전면 재작성을 하지 않는다
- API 응답은 일관된 JSON 포맷을 사용한다

### 백엔드 (Kotlin / Spring Boot)

- 새로운 엔티티는 JPA Entity + Repository + Service + Controller 구조를 따른다
- DB 스키마 변경은 Flyway 또는 JPA auto-ddl로 관리한다 (기존 프로젝트 방식을 따른다)
- 기존 Task 엔티티에 categoryId FK를 추가할 때 마이그레이션에 주의한다

### 프론트엔드 (React / TypeScript)

- 새로운 화면은 기존 라우팅 구조에 추가한다
- API 호출 함수는 별도 파일로 분리한다
- 타임 트리 컴포넌트는 재사용 가능하게 설계한다 (대시보드, 통계 화면 양쪽에서 사용)

---

## STEP 1: Category 엔티티 추가 및 Task 구조 변경

### 1-1. 백엔드 — Category 엔티티 생성

```kotlin
/**
 * 카테고리 엔티티
 * 사용자의 활동을 분류하는 최상위 단위이다.
 * 각 카테고리 하위에 여러 Task(항목)가 소속된다.
 */
@Entity
@Table(name = "categories")
data class Category(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    /** 카테고리 이름 (중복 불가) */
    @Column(nullable = false, unique = true)
    var name: String,

    /** 카테고리 설명 (선택) */
    var description: String? = null,

    /** 타임 트리 및 통계에서 사용할 색상 코드 (HEX) */
    @Column(nullable = false)
    var colorCode: String = "#3B82F6",

    /** UI 아이콘 식별자 (선택) */
    var icon: String? = null,

    /** 사용자 정의 정렬 순서 */
    @Column(nullable = false)
    var sortOrder: Int = 0,

    /** 활성 상태 */
    @Column(nullable = false)
    var isActive: Boolean = true,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
```

### 1-2. 백엔드 — Task 엔티티 수정

기존 Task 엔티티에 다음을 추가한다.

```kotlin
/** 소속 카테고리 (필수) */
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "category_id", nullable = false)
var category: Category

/** 즐겨찾기 여부 (수동 입력 시 빠른 선택용) */
@Column(nullable = false)
var isFavorite: Boolean = false
```

기존 Task의 `category: String?` 필드가 있다면 제거하고 FK 관계로 대체한다.

### 1-3. 백엔드 — Category API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | /api/categories | 카테고리 생성 |
| GET | /api/categories | 카테고리 목록 조회 (하위 항목 수 포함) |
| PUT | /api/categories/{id} | 카테고리 수정 |
| DELETE | /api/categories/{id} | 카테고리 삭제 (하위 항목 존재 시 거부 또는 비활성 처리) |

### 1-4. 백엔드 — Task API 변경

| 변경 | 내용 |
|------|------|
| POST /api/categories/{categoryId}/tasks | 카테고리 하위에 항목 생성 |
| GET /api/categories/{categoryId}/tasks | 카테고리별 항목 목록 |
| GET /api/tasks | 전체 항목 조회 (카테고리 정보 포함) |
| 기존 PUT, DELETE | 유지 |

### 1-5. 프론트엔드

- 기존 항목 관리 화면을 카테고리 > 항목 트리 구조로 변경한다
- 카테고리 CRUD 모달/폼을 추가한다
- 항목 생성 시 카테고리 선택 필드를 필수로 추가한다
- 카테고리별 색상이 UI 전체에서 일관되게 표시되도록 한다

### 1-6. 완료 기준

- [x] Category CRUD API 동작 확인
- [x] Task에 categoryId FK가 정상 연결됨
- [x] 프론트에서 카테고리 > 항목 계층 구조로 조회/생성 가능
- [x] 기존 타이머 기능이 카테고리 구조 변경 후에도 정상 동작

---

## STEP 2: ActivityLog 통합 테이블 및 수동 입력 기능

### 2-1. 백엔드 — ActivityLog 엔티티 생성

```kotlin
/**
 * 활동 기록 통합 엔티티
 * 타이머로 측정된 기록과 사용자가 직접 입력한 기록을 모두 저장한다.
 * source 필드로 기록 출처를 구분한다.
 */
@Entity
@Table(name = "activity_logs")
data class ActivityLog(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    /** 연결된 항목 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    var task: Task,

    /** 활동 시작 시각 */
    @Column(nullable = false)
    var startedAt: LocalDateTime,

    /** 활동 종료 시각 */
    @Column(nullable = false)
    var endedAt: LocalDateTime,

    /** 경과 시간 (초 단위, startedAt과 endedAt으로 자동 계산) */
    @Column(nullable = false)
    var durationSeconds: Long,

    /** 기록 출처: TIMER 또는 MANUAL */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var source: ActivitySource,

    /** 메모 (선택, 주로 수동 입력 시 활용) */
    var memo: String? = null,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class ActivitySource {
    TIMER,  // 타이머로 기록됨
    MANUAL  // 사용자가 직접 입력함
}
```

### 2-2. 백엔드 — 타이머 완료 시 ActivityLog 자동 생성

기존 타이머 종료(stop) 로직을 수정한다.

```
타이머 stop 호출 시:
1. 기존 TimerSession 상태를 종료 처리
2. ActivityLog를 자동 생성 (source = TIMER)
   - startedAt = TimerSession.startedAt
   - endedAt = 현재 시각
   - durationSeconds = 실제 경과 시간
   - task = TimerSession.task
3. TimerSession.activityLogId에 생성된 ActivityLog ID를 연결
```

### 2-3. 백엔드 — 수동 입력 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | /api/activity-logs | 수동 활동 기록 생성 |
| GET | /api/activity-logs?date=2026-02-01 | 특정 일자 활동 기록 조회 |
| GET | /api/activity-logs?from=...&to=... | 기간별 활동 기록 조회 |
| PUT | /api/activity-logs/{id} | 활동 기록 수정 |
| DELETE | /api/activity-logs/{id} | 활동 기록 삭제 |

**수동 입력 요청 본문:**

```json
{
  "taskId": 1,
  "startedAt": "2026-02-01T09:00:00",
  "endedAt": "2026-02-01T10:30:00",
  "memo": "Kotlin 스터디 진행"
}
```

**유효성 검증 규칙:**

- endedAt > startedAt 이어야 한다
- endedAt은 현재 시각 이후일 수 없다
- durationSeconds는 서버에서 자동 계산한다 (클라이언트 전송값 무시)
- 기존 기록과 시간이 겹치면 응답에 warning 필드를 포함하되 저장은 허용한다

### 2-4. 프론트엔드 — 수동 입력 화면

- 카테고리 선택 → 항목 선택 (또는 즐겨찾기에서 빠른 선택) → 시작 시각 → 종료 시각 → 메모 입력 → 저장
- 날짜/시간 피커 컴포넌트를 사용한다
- 저장 성공 시 타임 트리에 즉시 반영한다

### 2-5. 완료 기준

- [x] 수동으로 활동 기록을 생성/수정/삭제할 수 있다
- [x] 타이머 완료 시 ActivityLog가 자동 생성된다
- [x] 기존 통계 API가 ActivityLog 기반으로 동작한다 (기존 TimerSession 직접 조회에서 전환)
- [x] source 필드로 TIMER/MANUAL 구분이 가능하다

---

## STEP 3: 타임 트리 기능 구현

### 3-1. 백엔드 — 타임 트리 API

**일별 타임 트리:**

```
GET /api/timetree/daily?date=2026-02-01
```

응답:

```json
{
  "date": "2026-02-01",
  "blocks": [
    {
      "activityLogId": 1,
      "taskId": 3,
      "taskName": "코드 리뷰",
      "categoryId": 1,
      "categoryName": "업무",
      "colorCode": "#3B82F6",
      "startedAt": "2026-02-01T09:00:00",
      "endedAt": "2026-02-01T09:50:00",
      "durationSeconds": 3000,
      "source": "TIMER",
      "memo": null
    }
  ],
  "summary": {
    "totalSeconds": 18900,
    "byCategory": [
      { "categoryId": 1, "categoryName": "업무", "colorCode": "#3B82F6", "totalSeconds": 9900 },
      { "categoryId": 2, "categoryName": "학습", "colorCode": "#10B981", "totalSeconds": 5400 },
      { "categoryId": 3, "categoryName": "운동", "colorCode": "#F59E0B", "totalSeconds": 3600 }
    ]
  }
}
```

**주간 타임 트리:**

```
GET /api/timetree/weekly?date=2026-02-01
```

응답: 해당 주(월~일)의 각 날짜별 blocks 배열을 포함한다.

```json
{
  "weekStart": "2026-01-26",
  "weekEnd": "2026-02-01",
  "days": [
    { "date": "2026-01-26", "blocks": [...], "totalSeconds": 14400 },
    { "date": "2026-01-27", "blocks": [...], "totalSeconds": 18000 }
  ]
}
```

**월간 히트맵:**

```
GET /api/timetree/monthly?month=2026-02
```

응답: 각 날짜의 총 활동 시간만 포함한다 (히트맵 렌더링용).

```json
{
  "month": "2026-02",
  "days": [
    { "date": "2026-02-01", "totalSeconds": 18900 },
    { "date": "2026-02-02", "totalSeconds": 7200 }
  ]
}
```

### 3-2. 백엔드 — 쿼리 최적화

타임 트리 일별 조회 시 다음 조건으로 ActivityLog를 조회한다.

```sql
SELECT al.*, t.name as task_name, c.name as category_name, c.color_code
FROM activity_logs al
JOIN tasks t ON al.task_id = t.id
JOIN categories c ON t.category_id = c.id
WHERE DATE(al.started_at) = :date
ORDER BY al.started_at ASC
```

일별 조회 응답 시간 목표: 500ms 이내

### 3-3. 프론트엔드 — 타임 트리 컴포넌트

**TimeTree 컴포넌트 (재사용 가능):** 이 컴포넌트는 대시보드와 통계 화면 양쪽에서 사용한다.

```
Props:
  - date: string (YYYY-MM-DD)
  - blocks: ActivityBlock[]
  - onBlockClick: (block) => void       // 상세보기/편집
  - onEmptySlotClick: (time) => void    // 수동 기록 추가
  - viewMode: 'compact' | 'full'        // 대시보드용 축약 / 전용화면 전체
```

**일별 뷰 렌더링 규칙:**

- 세로축: 0시~24시 (또는 활동이 있는 범위만 표시)
- 각 블록: 카테고리 색상으로 채운 바, 높이는 시간에 비례
- 블록 내부: 항목 이름 + 경과 시간 표시
- 기록 출처 아이콘: 🕐(타이머) / ✏️(수동)
- 빈 구간: 점선으로 표시, 클릭하면 수동 기록 추가 모달 오픈
- 하단: 카테고리별 합계 요약 바

**주간 뷰:**

- 7개 칼럼 (월~일), 각 칼럼이 하루의 축약 타임 트리
- 칼럼 클릭 시 일별 뷰로 전환

**월간 뷰:**

- 캘린더 형태, 각 날짜 셀에 총 활동 시간을 색 농도로 표현
- 날짜 클릭 시 일별 뷰로 전환

### 3-4. 프론트엔드 — 빈 구간 → 수동 기록 연동

타임 트리의 빈 구간을 클릭하면 수동 기록 모달이 열리며, 시작 시각이 해당 빈 구간의 시작 시간으로 자동 채워진다.

### 3-5. 완료 기준

- [x] 일별 타임 트리 API 동작, 프론트에서 시간대별 블록 렌더링
- [x] 블록 클릭 시 상세보기/편집 가능
- [x] 빈 구간 클릭 시 수동 기록 추가 가능
- [x] 주간 뷰, 월간 히트맵 뷰 동작
- [x] 타이머 완료 후 타임 트리에 즉시 반영

---

## STEP 4: 통계 화면 확장 및 타임 트리 연동

### 4-1. 백엔드 — 통계 API 확장

기존 통계 API를 ActivityLog 기반으로 전환하고, 다음 엔드포인트를 추가한다.

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | /api/stats/by-category?from=...&to=... | 카테고리별 합계, 비율 |
| GET | /api/stats/by-source?from=...&to=... | 기록 출처별(TIMER/MANUAL) 합계, 비율 |

기존 통계 API의 데이터 소스를 TimerSession → ActivityLog로 변경한다.

### 4-2. 프론트엔드 — 통계 화면 재구성

통계 화면에 탭을 추가한다.

```
[차트] [타임 트리] [상세 테이블]
```

- **차트 탭:** 기존 막대/파이/라인 차트 + 카테고리별 필터 + 출처별 필터
- **타임 트리 탭:** 선택한 기간 내 날짜를 탐색하며 일별 타임 트리를 조회 (TimeTree 컴포넌트 재사용)
- **상세 테이블 탭:** 개별 ActivityLog를 테이블로 조회, 정렬/필터 가능

### 4-3. 완료 기준

- [x] 통계가 ActivityLog 기반으로 동작 (타이머 + 수동 통합)
- [x] 카테고리별, 출처별 통계 조회 가능
- [x] 통계 화면 내에서 타임 트리 탭으로 시간대별 분포 확인 가능

---

## STEP 5: 메인 대시보드 재구성

### 5-1. 대시보드 레이아웃

```
┌───────────────────────────────────────────────┐
│  오늘의 요약                                    │
│  총 활동: 4시간 30분 | 업무 2h | 학습 1.5h | …  │
├───────────────────┬───────────────────────────┤
│  현재 타이머       │  오늘의 타임 트리 (축약)    │
│                   │                           │
│  [코드 리뷰]       │  09:00 ████ 코드 리뷰     │
│  ⏱ 12:34         │  10:00 ██████ Kotlin      │
│                   │  13:00 ███ API 개발        │
│  [일시정지] [종료]  │  14:00 ████ 러닝          │
│                   │                           │
├───────────────────┴───────────────────────────┤
│  빠른 기록: [즐겨찾기 항목1] [항목2] [+ 수동입력] │
└───────────────────────────────────────────────┘
```

### 5-2. 구현 사항

- 왼쪽: 현재 활성 타이머 표시 및 제어
- 오른쪽: 오늘의 타임 트리 (compact 모드)
- 상단: 오늘 날짜의 카테고리별 합계 요약
- 하단: 즐겨찾기 항목 바로가기 + 수동 입력 버튼

### 5-3. 완료 기준

- [x] 대시보드에 타임 트리 축약 뷰 표시
- [x] 즐겨찾기 항목으로 빠른 타이머 시작 또는 수동 입력 가능
- [x] 타이머 종료/수동 입력 후 대시보드가 실시간 갱신

---

## 데이터 마이그레이션 주의사항

### 기존 데이터 처리

STEP 1에서 Category를 추가할 때, 기존 Task 데이터를 처리해야 한다.

```
1. "기본" 카테고리를 자동 생성한다 (name="기본", colorCode="#6B7280")
2. 기존 Task에 category 필드가 문자열로 존재하면:
   - 해당 문자열 값으로 Category를 생성한다
   - Task.categoryId를 해당 Category로 연결한다
3. category 필드가 null인 Task는 "기본" 카테고리에 연결한다
```

STEP 2에서 ActivityLog를 추가할 때, 기존 TimerSession 데이터를 처리해야 한다.

```
1. status가 COMPLETED인 기존 TimerSession을 ActivityLog로 변환한다
   - source = TIMER
   - durationSeconds = elapsed
   - startedAt, endedAt 그대로 복사
2. 변환 후 기존 통계 로직을 ActivityLog 기반으로 전환한다
3. TimerSession 테이블은 진행 중 상태 관리 용도로 유지한다
```

---

## 전체 구현 순서 요약

```
STEP 1: Category + Task 구조 변경
  └─ DB 마이그레이션 → Category 엔티티/API → Task FK 추가 → 프론트 화면 변경

STEP 2: ActivityLog + 수동 입력
  └─ ActivityLog 엔티티/API → 타이머 stop 연동 → 수동 입력 화면 → 기존 데이터 마이그레이션

STEP 3: 타임 트리
  └─ 타임 트리 API → TimeTree 컴포넌트 → 일별/주간/월간 뷰 → 빈 구간 연동

STEP 4: 통계 확장
  └─ 통계 API ActivityLog 전환 → 카테고리별/출처별 통계 → 통계 화면 탭 재구성

STEP 5: 대시보드 재구성
  └─ 레이아웃 변경 → 타임 트리 축약 뷰 연동 → 즐겨찾기 빠른 기록
```

각 STEP은 이전 STEP이 완료된 후 진행한다. 각 STEP 완료 후 기존 기능이 정상 동작하는지 반드시 확인한다.