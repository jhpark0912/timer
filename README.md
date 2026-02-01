# ⏱ Alert - 타이머 기반 일정관리 시스템

태스크에 카운트다운 타이머를 설정하고, 완료 시 알림을 받으며, 누적 시간 통계를 확인하는 웹 애플리케이션.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Kotlin, Spring Boot 3.2, Spring Data JPA, Gradle |
| 프론트엔드 | React 19, TypeScript, Tailwind CSS, Vite |
| 데이터베이스 | PostgreSQL 16 |
| 배포 | Docker Compose |

## 시작하기

### 방법 1: Docker Compose (권장)

모든 서비스를 한 번에 실행합니다.

```bash
docker-compose up -d
```

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost |
| 백엔드 API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

종료:

```bash
docker-compose down
```

데이터 초기화 (PostgreSQL 볼륨 삭제):

```bash
docker-compose down -v
```

### 방법 2: 로컬 개발

#### 사전 준비

- JDK 17+
- Node.js 20+
- PostgreSQL 16 (Docker로 대체 가능)

#### 1) 데이터베이스

PostgreSQL이 로컬에 없으면 Docker로 실행:

```bash
docker run -d \
  --name alert-db \
  -e POSTGRES_DB=alert \
  -e POSTGRES_USER=alert \
  -e POSTGRES_PASSWORD=alert \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 2) 백엔드

```bash
cd backend
./gradlew bootRun
```

http://localhost:8080 에서 API 서버가 실행됩니다.

#### 3) 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173 에서 개발 서버가 실행됩니다.
`/api` 요청은 자동으로 백엔드(8080)로 프록시됩니다.

## 프로젝트 구조

```
alert/
├── backend/                  # Spring Boot API 서버
│   ├── src/main/kotlin/com/alert/
│   │   ├── domain/
│   │   │   ├── task/         # 태스크 CRUD
│   │   │   └── timer/        # 타이머 제어
│   │   └── config/           # CORS, 예외처리
│   └── src/main/resources/
│       └── application.yml
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios API 클라이언트
│   │   ├── components/       # UI 컴포넌트
│   │   ├── hooks/            # useTasks, useTimer
│   │   ├── pages/            # Dashboard, TaskManage
│   │   └── types/            # TypeScript 타입
│   └── nginx.conf            # 프로덕션 Nginx 설정
└── docker-compose.yml
```

## API 엔드포인트

### 항목 관리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/tasks` | 항목 목록 조회 |
| POST | `/api/tasks` | 항목 생성 |
| PUT | `/api/tasks/{id}` | 항목 수정 |
| DELETE | `/api/tasks/{id}` | 항목 삭제 |

### 타이머 제어

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/timer/active` | 활성 타이머 조회 |
| POST | `/api/timer/start` | 타이머 시작 |
| POST | `/api/timer/{id}/pause` | 일시정지 |
| POST | `/api/timer/{id}/resume` | 재개 |
| POST | `/api/timer/{id}/stop` | 종료 |
