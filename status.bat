@echo off
chcp 65001 >nul 2>&1
title Alert - 상태 확인

echo ============================================
echo   Alert 타이머 일정관리 시스템 - 상태
echo ============================================
echo.

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Docker가 실행되고 있지 않습니다.
    echo.
    pause
    exit /b 1
)

echo [컨테이너 상태]
echo.
docker compose ps
echo.

echo ============================================
echo   로그 확인 명령어:
echo     전체:    docker compose logs
echo     실시간:  docker compose logs -f
echo     백엔드:  docker compose logs backend
echo     DB:      docker compose logs database
echo ============================================
echo.
pause
