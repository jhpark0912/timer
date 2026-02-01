@echo off
chcp 65001 >nul 2>&1
title Alert - 시작

echo ============================================
echo   Alert 타이머 일정관리 시스템 - 시작
echo ============================================
echo.

:: Docker 데몬 확인
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Docker가 실행되고 있지 않습니다.
    echo   Docker Desktop을 먼저 시작해주세요.
    echo   (setup.bat을 실행하면 상세 안내를 볼 수 있습니다)
    echo.
    pause
    exit /b 1
)

:: 서비스 시작
echo 서비스를 시작합니다...
echo (첫 실행 시 이미지 빌드로 시간이 걸릴 수 있습니다)
echo.
docker compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [오류] 서비스 시작에 실패했습니다.
    echo   로그를 확인하려면: docker compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   서비스가 시작되었습니다!
echo ============================================
echo.
echo   웹 애플리케이션:  http://localhost
echo   백엔드 API:       http://localhost:8080
echo   데이터베이스:     localhost:5432
echo.
echo   종료: stop.bat
echo   상태: status.bat
echo.
pause
