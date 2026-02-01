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
docker compose up -d
```

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost |
| 백엔드 API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

종료:

```bash
docker compose down
```

데이터 초기화 (PostgreSQL 볼륨 삭제):

```bash
docker compose down -v
```

### 방법 1-1: Windows 간편 실행 (배치 파일)

Windows 환경에서 명령어 입력 없이 더블클릭만으로 서비스를 관리할 수 있습니다.

#### 사전 준비

1. **Docker Desktop 설치**
   - https://www.docker.com/products/docker-desktop/ 에서 다운로드
   - 설치 시 "Use WSL 2 instead of Hyper-V" 옵션 권장 (Windows 10/11)
   - 설치 완료 후 PC 재시작이 필요할 수 있음

2. **Docker Desktop 실행 확인**
   - Windows 작업표시줄 우측 트레이에서 Docker 아이콘(고래 모양) 확인
   - 아이콘이 **녹색/안정** 상태일 때 사용 가능
   - 처음 실행 시 WSL 2 업데이트를 요구할 수 있음 → 안내에 따라 설치

#### 제공되는 배치 파일

프로젝트 루트 디렉토리에 4개의 `.bat` 파일이 있습니다.

| 파일 | 용도 | 언제 사용하나요? |
|------|------|-----------------|
| `setup.bat` | Docker 환경 점검 | 최초 1회, 또는 실행이 안 될 때 |
| `start.bat` | 서비스 시작 | 앱을 사용하고 싶을 때 |
| `stop.bat` | 서비스 종료 | 앱 사용을 마칠 때 |
| `status.bat` | 상태 확인 | 현재 실행 상태가 궁금할 때 |

#### STEP 1: 환경 점검 — `setup.bat`

프로젝트 폴더에서 `setup.bat`을 **더블클릭**합니다.

```
============================================
  Alert 타이머 일정관리 시스템 - 초기 설정
============================================

[1/3] Docker 설치 확인 중...
  Docker version 27.x.x, build xxxxxxx
  [확인] Docker 설치됨

[2/3] Docker Compose 확인 중...
  Docker Compose version v2.x.x
  [확인] Docker Compose 사용 가능

[3/3] Docker 데몬 실행 확인 중...
  [확인] Docker 데몬 실행 중

============================================
  모든 확인 완료! 시스템을 시작할 수 있습니다.
============================================
```

위와 같이 3개 항목 모두 `[확인]`이 표시되면 준비 완료입니다.

**오류가 발생하면:**

| 오류 메시지 | 해결 방법 |
|------------|----------|
| "Docker가 설치되어 있지 않습니다" | Docker Desktop을 설치하세요 |
| "Docker Compose를 사용할 수 없습니다" | Docker Desktop을 최신 버전으로 업데이트하세요 |
| "Docker 데몬이 실행되고 있지 않습니다" | Docker Desktop을 실행하고 트레이 아이콘이 안정될 때까지 기다리세요 |

#### STEP 2: 서비스 시작 — `start.bat`

`start.bat`을 **더블클릭**합니다.

```
============================================
  Alert 타이머 일정관리 시스템 - 시작
============================================

서비스를 시작합니다...
(첫 실행 시 이미지 빌드로 시간이 걸릴 수 있습니다)

 ✔ Container alert-database-1  Started
 ✔ Container alert-backend-1   Started
 ✔ Container alert-frontend-1  Started

============================================
  서비스가 시작되었습니다!
============================================

  웹 애플리케이션:  http://localhost
  백엔드 API:       http://localhost:8080
  데이터베이스:     localhost:5432
```

- **첫 실행**: Docker 이미지를 빌드하므로 네트워크 상태에 따라 수 분 소요
- **이후 실행**: 이미지가 캐시되어 빠르게 시작
- 시작 완료 후 브라우저에서 **http://localhost** 접속

**오류가 발생하면:**

| 증상 | 확인 사항 |
|------|----------|
| "Docker가 실행되고 있지 않습니다" | Docker Desktop 실행 후 재시도 |
| 빌드 중 에러 | `docker compose logs` 명령으로 상세 로그 확인 |
| 포트 충돌 (port already in use) | 80, 8080, 5432 포트를 사용하는 다른 프로그램 종료 |

#### STEP 3: 서비스 종료 — `stop.bat`

`stop.bat`을 **더블클릭**합니다.

```
============================================
  Alert 타이머 일정관리 시스템 - 종료
============================================

 ✔ Container alert-frontend-1  Removed
 ✔ Container alert-backend-1   Removed
 ✔ Container alert-database-1  Removed

  서비스가 종료되었습니다.
  (데이터베이스 데이터는 Docker Volume에 보존됩니다)
```

- 종료해도 데이터베이스 데이터는 **삭제되지 않습니다** (Docker Volume 보존)
- 다음에 `start.bat`으로 다시 시작하면 이전 데이터가 그대로 유지됩니다

#### STEP 4: 상태 확인 — `status.bat`

`status.bat`을 **더블클릭**하면 현재 컨테이너 상태를 확인할 수 있습니다.

```
============================================
  Alert 타이머 일정관리 시스템 - 상태
============================================

[컨테이너 상태]

NAME                   STATUS          PORTS
alert-database-1       Up 5 minutes    0.0.0.0:5432->5432/tcp
alert-backend-1        Up 5 minutes    0.0.0.0:8080->8080/tcp
alert-frontend-1       Up 5 minutes    0.0.0.0:80->80/tcp
```

STATUS가 `Up`이면 정상 동작 중입니다.

#### 자주 묻는 질문 (FAQ)

**Q: 데이터를 완전히 초기화하고 싶어요.**
명령 프롬프트(cmd)를 열고 프로젝트 폴더에서 실행:
```bash
docker compose down -v
```
`-v` 옵션이 데이터베이스 볼륨을 함께 삭제합니다.

**Q: 이미지를 처음부터 다시 빌드하고 싶어요.**
```bash
docker compose build --no-cache
docker compose up -d
```

**Q: 특정 서비스 로그만 보고 싶어요.**
```bash
docker compose logs backend        # 백엔드 로그
docker compose logs database       # DB 로그
docker compose logs frontend       # 프론트엔드 로그
docker compose logs -f backend     # 실시간 로그 (-f 옵션)
```

**Q: 80 포트를 다른 프로그램이 사용하고 있어요.**
`docker-compose.yml`의 frontend 포트를 수정하세요:
```yaml
frontend:
  ports:
    - "3000:80"   # 80 대신 3000 사용
```
이후 http://localhost:3000 으로 접속합니다.

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
