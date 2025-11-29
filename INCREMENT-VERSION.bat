@echo off
echo ============================================
echo  VERSION INCREMENT HELPER
echo ============================================
echo.
echo This script helps you remember to update version codes
echo before building a new APK.
echo.
echo IMPORTANT: You must manually edit these files!
echo.

set /p NEW_VERSION_CODE="Enter NEW versionCode (e.g., 2): "
set /p NEW_VERSION_NAME="Enter NEW versionName (e.g., 1.1.0): "

echo.
echo ============================================
echo  UPDATE CHECKLIST
echo ============================================
echo.
echo Please update these files manually:
echo.
echo 1️⃣ android/app/build.gradle
echo    Change line:
echo       versionCode 1        → versionCode %NEW_VERSION_CODE%
echo       versionName "1.0.0"  → versionName "%NEW_VERSION_NAME%"
echo.
echo 2️⃣ src/hooks/useUpdateCheck.ts
echo    Change line:
echo       const CURRENT_VERSION_CODE = 1;
echo       to
echo       const CURRENT_VERSION_CODE = %NEW_VERSION_CODE%;
echo.
echo ============================================
echo.
echo After updating, you can build the APK:
echo   BUILD-APK-WITH-PERMISSIONS.bat
echo.
echo Then create a GitHub release:
echo   1. Go to: https://github.com/mikuare/qmaz-project-update/releases/new
echo   2. Tag: v%NEW_VERSION_NAME%
echo   3. Upload APK
echo   4. Update update.json
echo.
pause

echo.
echo Opening files for editing...
start "" "android\app\build.gradle"
timeout /t 1 >nul
start "" "src\hooks\useUpdateCheck.ts"

echo.
echo ✅ Files opened!
echo.
echo After editing, press any key to continue...
pause >nul

