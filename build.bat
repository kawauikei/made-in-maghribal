@echo off
setlocal enabledelayedexpansion

echo ========================================
echo [Made in Maghribal] New Build System
echo ========================================

echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    exit /b %ERRORLEVEL%
)

echo [2/3] Building projects (Vite)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Vite build or post-build failed.
    exit /b %ERRORLEVEL%
)

echo [3/3] Final checks...
if exist public\main.js (
    echo  - main.js: OK (in public/^)
) else (
    echo  - [ERROR] main.js missing.
)

if exist main.canvas.jsx (
    echo  - main.canvas.jsx: OK
) else (
    echo  - [ERROR] main.canvas.jsx missing.
)

echo ========================================
echo Build SUCCESSFUL.
echo Generated: main.js, main.canvas.jsx
echo ========================================
pause
