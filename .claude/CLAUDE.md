# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

타이머 기반 일정관리 시스템. 사용자가 태스크에 카운트다운 타이머를 설정하고, 완료 시 알림을 받으며, 누적 시간 통계를 확인하는 웹 애플리케이션.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Kotlin, Spring Boot, Spring Data JPA, Gradle (Kotlin DSL) |
| 프론트엔드 | React, TypeScript, Tailwind CSS 또는 Styled Components |
| 데이터베이스 | PostgreSQL 16 |
| 배포 | Docker Compose (frontend/backend/database 3컨테이너) |
| Java | Azul JDK 17+ (eclipse-temurin:21 for Docker) |

## 프로젝트 구조

```
alert/
├── backend/          # Spring Boot API 서버 (Kotlin)
│   ├── build.gradle.kts
│   └── src/
│       ├── main/kotlin/com/alert/
│       └── main/resources/
├── frontend/         # React SPA (TypeScript)
│   ├── package.json
│   └── src/
├── docker-compose.yml
└── .claude/
    └── PRD_타이머_기반_일정관리_시스템.md  # 상세 요구사항 문서
```

## 빌드 및 실행 명령

### 전체 시스템 (Docker)
```bash
docker-compose up -d          # 전체 기동
docker-compose down           # 전체 종료
```

### 백엔드
```bash
cd backend
./gradlew build               # 빌드
./gradlew bootRun             # 로컬 실행 (포트 8080)
./gradlew test                # 전체 테스트
./gradlew test --tests "com.alert.SomeTest.someMethod"  # 단일 테스트
```

### 프론트엔드
```bash
cd frontend
npm install                   # 의존성 설치
npm run dev                   # 개발 서버
npm run build                 # 프로덕션 빌드
npm test                      # 테스트
```

## 개발 규칙

- **모킹 절대 금지**: 모든 데이터는 실제 사용자 입력 및 타이머 동작으로부터 생성된 실데이터만 사용
- **TypeScript 엄격 모드 준수**
- **Kotlin 코드에 한국어 주석 포함**: 클래스, 메서드, 주요 로직의 의도를 명시
- native query가 필요한 경우 `RepositoryCustom` 인터페이스 + `Impl` 클래스를 만들고 QueryDSL로 구현
- 스키마에 `date_created`, `date_updated` 컬럼이 있으면 `BaseEntity`를 상속

## 아키텍처 핵심 포인트

### 백엔드 API 구조
- RESTful JSON API (`/api/tasks`, `/api/timer/*`, `/api/stats`)
- 한 시점에 하나의 타이머만 활성화 (다른 타이머 시작 시 현재 타이머 자동 일시정지)
- 타이머 시작 시 서버에 시작/만료 예정 시각을 기록하여 클라이언트 재접속 시 상태 보정

### 프론트엔드 타이머/알림 구조
- **Web Worker**: 타이머 카운트다운 연산 (메인 스레드 분리, 탭 비활성 쓰로틀링 우회)
- **Service Worker**: 백그라운드 알림 발행 (`showNotification()`)
- **Browser Notification API**: 시스템 알림 (권한 거부 시 인앱 토스트로 대체)
- 타이머 동작 중 브라우저 탭 타이틀에 남은 시간 표시 (예: `⏱ 04:32 - 독서`)

### 데이터 모델
- `Task`: 항목 (name unique, category/태그, 활성/비활성)
- `TimerSession`: 타이머 세션 기록 (taskId FK, duration, elapsed, status: RUNNING/PAUSED/COMPLETED/CANCELLED)

### Docker 컨테이너
- `frontend`: Nginx (포트 80, `/api` 경로를 backend로 리버스 프록시)
- `backend`: Spring Boot (포트 8080)
- `database`: PostgreSQL (포트 5432, Docker Volume으로 데이터 영속)
