@echo off
chcp 65001 >nul 2>&1
title Alert - 종료

echo ============================================
echo   Alert 타이머 일정관리 시스템 - 종료
echo ============================================
echo.

docker compose down

if %errorlevel% equ 0 (
    echo.
    echo   서비스가 종료되었습니다.
    echo   (데이터베이스 데이터는 Docker Volume에 보존됩니다)
) else (
    echo.
    echo [오류] 서비스 종료 중 문제가 발생했습니다.
)

echo.
pause
