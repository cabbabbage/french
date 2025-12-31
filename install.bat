@echo off
setlocal EnableExtensions EnableDelayedExpansion

title Node + React + TypeScript Installer (All Fallbacks)

echo.
echo ==========================================================
echo  Node.js + React + TypeScript setup (all fallback paths)
echo  Project: %CD%
echo ==========================================================
echo.

REM ----------------------------------------------------------
REM Helpers
REM ----------------------------------------------------------
set "SCRIPT_DIR=%CD%"
set "NODE_PORTABLE_DIR=%LOCALAPPDATA%\nodejs"
set "TEMP_DIR=%TEMP%\node_install_tmp"
set "LOG=%TEMP%\install_everything.log"

REM Detect admin
net session >nul 2>&1
if %errorlevel%==0 (
  set "IS_ADMIN=1"
) else (
  set "IS_ADMIN=0"
)

REM Detect architecture
set "ARCH=x64"
if /I "%PROCESSOR_ARCHITECTURE%"=="x86" set "ARCH=x86"
if /I "%PROCESSOR_ARCHITEW6432%"=="x86" set "ARCH=x86"

echo [INFO] Admin: %IS_ADMIN%
echo [INFO] Arch: %ARCH%
echo [INFO] Log:  %LOG%
echo.

REM ----------------------------------------------------------
REM 0) If node/npm already exist, skip install
REM ----------------------------------------------------------
where node >nul 2>&1
if %errorlevel%==0 (
  where npm >nul 2>&1
  if %errorlevel%==0 (
    echo [OK] Node and npm already found.
    goto :install_packages
  )
)

REM ----------------------------------------------------------
REM 1) Try winget if available
REM ----------------------------------------------------------
where winget >nul 2>&1
if %errorlevel%==0 (
  echo [INFO] winget found. Trying Node.js LTS install...
  winget install -e --id OpenJS.NodeJS.LTS --source winget >> "%LOG%" 2>&1

  REM Refresh PATH for typical node install dirs
  if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
  if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"

  where node >nul 2>&1
  if %errorlevel%==0 (
    where npm >nul 2>&1
    if %errorlevel%==0 (
      echo [OK] Node installed via winget.
      goto :install_packages
    )
  )
  echo [WARN] winget path did not work or install failed. Continuing...
  echo.
) else (
  echo [INFO] winget not found. Continuing...
  echo.
)

REM ----------------------------------------------------------
REM 2) Try Chocolatey if admin
REM ----------------------------------------------------------
if "%IS_ADMIN%"=="1" (
  echo [INFO] Running as Admin. Trying Chocolatey path...

  where choco >nul 2>&1
  if %errorlevel%neq 0 (
    echo [INFO] Chocolatey not found. Installing Chocolatey...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "Set-ExecutionPolicy Bypass -Scope Process -Force; " ^
      "[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor 3072; " ^
      "iex ((New-Object Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" >> "%LOG%" 2>&1
  )

  set "PATH=%ALLUSERSPROFILE%\chocolatey\bin;%PATH%"
  where choco >nul 2>&1
  if %errorlevel%==0 (
    echo [INFO] Installing Node.js LTS via Chocolatey...
    choco install nodejs-lts -y >> "%LOG%" 2>&1

    if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
    if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"

    where node >nul 2>&1
    if %errorlevel%==0 (
      where npm >nul 2>&1
      if %errorlevel%==0 (
        echo [OK] Node installed via Chocolatey.
        goto :install_packages
      )
    )
    echo [WARN] Chocolatey install did not result in node/npm. Continuing...
    echo.
  ) else (
    echo [WARN] Chocolatey could not be installed or found. Continuing...
    echo.
  )
) else (
  echo [INFO] Not running as Admin. Skipping Chocolatey path.
  echo.
)

REM ----------------------------------------------------------
REM 3) Portable per-user Node install (no admin required)
REM ----------------------------------------------------------
echo [INFO] Falling back to portable Node.js install (per-user)...
echo [INFO] This will download latest LTS zip from nodejs.org to:
echo        %NODE_PORTABLE_DIR%
echo.

if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%" >nul 2>&1
if not exist "%NODE_PORTABLE_DIR%" mkdir "%NODE_PORTABLE_DIR%" >nul 2>&1

REM Download index.json, pick newest LTS, download zip, expand
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$arch='%ARCH%';" ^
  "$base='https://nodejs.org/dist';" ^
  "$idx=Invoke-RestMethod -Uri ($base + '/index.json');" ^
  "$lts=$idx | Where-Object { $_.lts -ne $false -and $_.lts -ne $null } | Select-Object -First 1;" ^
  "if(-not $lts){ throw 'Could not find LTS in index.json' }" ^
  "$ver=$lts.version;" ^
  "$zipName=('node-' + $ver + '-win-' + $arch + '.zip');" ^
  "$zipUrl=($base + '/' + $ver + '/' + $zipName);" ^
  "$zipPath=Join-Path $env:TEMP 'node_lts.zip';" ^
  "Write-Host ('Downloading ' + $zipUrl);" ^
  "Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing;" ^
  "$dest='%NODE_PORTABLE_DIR%';" ^
  "if(Test-Path $dest){ }" ^
  "Expand-Archive -Path $zipPath -DestinationPath $dest -Force;" ^
  "$folder=Get-ChildItem $dest | Where-Object { $_.PSIsContainer -and $_.Name -like 'node-v*-win-*' } | Select-Object -First 1;" ^
  "if(-not $folder){ throw 'Expanded folder not found' }" ^
  "$nodeHome=$folder.FullName;" ^
  "Write-Host ('NODE_HOME=' + $nodeHome);" ^
  "Set-Content -Path (Join-Path $dest 'NODE_HOME.txt') -Value $nodeHome -Encoding ASCII;" >> "%LOG%" 2>&1

if %errorlevel% neq 0 (
  echo [ERROR] Portable install failed. Check the log:
  echo        %LOG%
  echo.
  echo Common causes:
  echo  - nodejs.org blocked by your network
  echo  - TLS interception breaking downloads
  echo.
  echo Manual fix:
  echo  - Download Node.js LTS installer from nodejs.org and install it.
  pause
  exit /b 1
)

REM Read NODE_HOME from file
set "NODE_HOME="
for /f "usebackq delims=" %%A in ("%NODE_PORTABLE_DIR%\NODE_HOME.txt") do set "NODE_HOME=%%A"

if not exist "%NODE_HOME%\node.exe" (
  echo [ERROR] node.exe not found in portable install folder.
  echo        Log: %LOG%
  pause
  exit /b 1
)

REM Add to PATH for current session
set "PATH=%NODE_HOME%;%PATH%"

REM Persist to user PATH (no admin)
for /f "tokens=2,*" %%A in ('reg query HKCU\Environment /v PATH 2^>nul ^| find /I "PATH"') do set "USER_PATH=%%B"
if not defined USER_PATH set "USER_PATH="

echo [INFO] Adding Node to user PATH (persistent)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$nodeHome='%NODE_HOME%';" ^
  "$p=[Environment]::GetEnvironmentVariable('Path','User');" ^
  "if(-not $p){ $p='' }" ^
  "if($p -notlike ('*' + $nodeHome + '*')){ " ^
  "  $new=($nodeHome + ';' + $p).Trim(';');" ^
  "  [Environment]::SetEnvironmentVariable('Path',$new,'User');" ^
  "  Write-Host 'User PATH updated.';" ^
  "} else { Write-Host 'User PATH already contains Node.' }" >> "%LOG%" 2>&1

REM Verify
where node >nul 2>&1 || (echo [ERROR] node still not found after portable install.& pause& exit /b 1)
where npm  >nul 2>&1 || (echo [ERROR] npm still not found after portable install.& pause& exit /b 1)

echo [OK] Node installed (portable).
echo.

REM ----------------------------------------------------------
REM 4) Install project packages
REM ----------------------------------------------------------
:install_packages
echo [OK] node:
node -v
echo [OK] npm:
npm -v
echo.

if not exist package.json (
  echo [INFO] package.json not found. Creating one...
  npm init -y >> "%LOG%" 2>&1
  if %errorlevel% neq 0 (
    echo [ERROR] npm init failed. See log: %LOG%
    pause
    exit /b 1
  )
)

echo [INFO] Installing react + react-dom...
npm install react react-dom >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Failed installing react/react-dom. See log: %LOG%
  pause
  exit /b 1
)

echo [INFO] Installing TypeScript + React types...
npm install -D typescript @types/react @types/react-dom >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Failed installing typescript/@types. See log: %LOG%
  pause
  exit /b 1
)

REM Ensure tsconfig with JSX setting
if not exist tsconfig.json (
  echo [INFO] Creating tsconfig.json...
  npm exec --yes tsc -- --init >> "%LOG%" 2>&1
)

echo [INFO] Ensuring tsconfig.json has jsx = react-jsx...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p='tsconfig.json';" ^
  "if(!(Test-Path $p)){ exit 0 }" ^
  "$t=Get-Content $p -Raw;" ^
  "if($t -notmatch '\"jsx\"'){ " ^
  "  $t=$t -replace '\"compilerOptions\"\\s*:\\s*\\{', '\"compilerOptions\": {`r`n    \"jsx\": \"react-jsx\",';" ^
  "  Set-Content $p $t -Encoding UTF8;" ^
  "} " >> "%LOG%" 2>&1

echo.
echo ==========================================================
echo  DONE.
echo  If VS Code still shows: Cannot find module 'react'
echo   1) Close VS Code completely and reopen
echo   2) Command Palette: TypeScript: Restart TS Server
echo   3) Make sure you opened the folder that contains package.json
echo.
echo  Log file:
echo   %LOG%
echo ==========================================================
echo.
pause
exit /b 0
