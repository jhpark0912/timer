@echo off
chcp 65001 >nul 2>&1
title Alert - 초기 설정

echo ============================================
echo   Alert 타이머 일정관리 시스템 - 초기 설정
echo ============================================
echo.

:: Docker 설치 확인
echo [1/3] Docker 설치 확인 중...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [오류] Docker가 설치되어 있지 않습니다.
    echo.
    echo   Docker Desktop을 먼저 설치해주세요:
    echo   https://www.docker.com/products/docker-desktop/
    echo.
    echo   설치 후 Docker Desktop을 실행하고 다시 이 스크립트를 실행하세요.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do echo   %%i
echo   [확인] Docker 설치됨

:: Docker Compose 확인
echo.
echo [2/3] Docker Compose 확인 중...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [오류] Docker Compose를 사용할 수 없습니다.
    echo   Docker Desktop이 실행 중인지 확인해주세요.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker compose version') do echo   %%i
echo   [확인] Docker Compose 사용 가능

:: Docker 데몬 실행 확인
echo.
echo [3/3] Docker 데몬 실행 확인 중...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [오류] Docker 데몬이 실행되고 있지 않습니다.
    echo   Docker Desktop을 시작해주세요.
    echo.
    echo   시작 방법:
    echo   1. Windows 검색에서 "Docker Desktop" 검색
    echo   2. Docker Desktop 실행
    echo   3. 트레이 아이콘이 녹색으로 바뀔 때까지 대기
    echo   4. 다시 이 스크립트를 실행
    echo.
    pause
    exit /b 1
)
echo   [확인] Docker 데몬 실행 중

echo.
echo ============================================
echo   모든 확인 완료! 시스템을 시작할 수 있습니다.
echo ============================================
echo.
echo   시작: start.bat 실행
echo   종료: stop.bat 실행
echo   상태: status.bat 실행
echo.
pause
