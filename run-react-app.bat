@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ensure script runs from repo root and keep a log for installs
cd /d "%~dp0"
set "LOG=%TEMP%\french-react-setup.log"

echo ===========================================================
echo Installing and launching the French React learning app
echo Log: %LOG%
echo Project: %CD%
echo ===========================================================

REM abort if React project is missing
if not exist "package.json" (
  echo [ERROR] package.json not found. Run the script from the project root.
  exit /b 1
)

REM ensure Node and npm are available
for %%X in (node npm) do (
  where %%X >nul 2>&1
  if errorlevel 1 (
    echo [ERROR] %%X is not installed. Please install Node.js LTS from https://nodejs.org before running this script.
    exit /b 1
  )
)

echo [INFO] Installing project dependencies...
npm install >> "%LOG%" 2>&1
if errorlevel 1 (
  echo [ERROR] npm install failed. Check %LOG% for details.
  exit /b 1
)

echo [INFO] Starting the dev server...
npm run dev

endlocal
