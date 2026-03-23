@echo off
echo ============================================
echo Fix Windows npm run dev / Rollup Error
echo ============================================
echo.
echo This project folder was installed from another OS.
echo Windows needs its own node_modules with the Win32 Rollup package.
echo.
echo Step 1: Removing old node_modules...
if exist node_modules (
  rmdir /s /q node_modules
)
echo.
echo Step 2: Installing dependencies for Windows...
call npm install

if errorlevel 1 (
  echo.
  echo [ERROR] npm install failed.
  echo Run it again in this same Windows terminal and check the error.
  pause
  exit /b 1
)

echo.
echo Step 3: Verifying Rollup package...
if not exist node_modules\@rollup\rollup-win32-x64-msvc (
  echo [ERROR] Windows Rollup package is still missing.
  echo Try deleting package-lock.json too, then run npm install again.
  pause
  exit /b 1
)

echo.
echo [OK] Windows dependencies are installed.
echo You can now run: npm run dev
echo.
pause
