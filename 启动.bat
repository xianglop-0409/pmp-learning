@echo off
title PMP Learning Machine
cd /d "%~dp0"

echo ============================================
echo   PMP Learning Machine
echo ============================================
echo.

REM Kill old python server on 9000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [1/2] Starting server on port 9000...
start "PMP-Server" /min python -m http.server 9000 --bind 0.0.0.0
timeout /t 3 /nobreak >nul

echo [2/2] Opening app window (no browser chrome)...

set "APP_URL=http://localhost:9000"
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

set "EDGE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if defined CHROME (
  echo   Chrome found - launching app window...
  start "" "%CHROME%" --app=%APP_URL%
) else if defined EDGE (
  echo   Edge found - launching app window...
  start "" "%EDGE%" --app=%APP_URL%
) else (
  echo   No Chrome/Edge found - opening default browser...
  start %APP_URL%
)

echo.
echo ============================================
echo   DONE - App window should now be open.
echo.
echo   The minimized "PMP-Server" window must stay
echo   open (closing it stops the app).
echo ============================================
echo.
pause
