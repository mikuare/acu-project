@echo off
setlocal enabledelayedexpansion
color 0A
title Build APK with Update System - Automated

echo.
echo ============================================
echo   BUILD APK WITH UPDATE SYSTEM
echo ============================================
echo.
echo This script will:
echo   1. Check your version settings
echo   2. Build the web app
echo   3. Sync to Android
echo   4. Build signed release APK
echo   5. Copy APK to easy location
echo.

REM ============================================
REM Check Version Settings
REM ============================================
echo.
echo [Step 1/5] Checking version settings...
echo.

REM Read version from build.gradle
set "GRADLE_FILE=android\app\build.gradle"
if not exist "%GRADLE_FILE%" (
    echo ERROR: build.gradle not found at %GRADLE_FILE%
    echo Are you in the correct project directory?
    pause
    exit /b 1
)

REM Extract versionCode
for /f "tokens=2" %%a in ('findstr /C:"versionCode" "%GRADLE_FILE%"') do (
    set "GRADLE_VERSION=%%a"
    goto :found_gradle
)
:found_gradle

REM Read version from useUpdateCheck.ts
set "HOOK_FILE=src\hooks\useUpdateCheck.ts"
if not exist "%HOOK_FILE%" (
    echo ERROR: useUpdateCheck.ts not found at %HOOK_FILE%
    pause
    exit /b 1
)

REM Extract CURRENT_VERSION_CODE
for /f "tokens=4" %%a in ('findstr /C:"CURRENT_VERSION_CODE" "%HOOK_FILE%"') do (
    set "HOOK_VERSION=%%a"
    set "HOOK_VERSION=!HOOK_VERSION:;=!"
    goto :found_hook
)
:found_hook

echo.
echo Version Check:
echo   - build.gradle versionCode: %GRADLE_VERSION%
echo   - useUpdateCheck.ts CURRENT_VERSION_CODE: %HOOK_VERSION%
echo.

if "%GRADLE_VERSION%"=="%HOOK_VERSION%" (
    echo [OK] Versions MATCH! Good to go.
) else (
    echo [WARNING] Versions DO NOT MATCH!
    echo.
    echo This might cause issues. They should be the same.
    echo Do you want to continue anyway?
    echo.
    choice /C YN /M "Continue"
    if errorlevel 2 exit /b 1
)

echo.
echo Building APK Version: %GRADLE_VERSION%
echo.
pause

REM ============================================
REM Build Web App
REM ============================================
echo.
echo ============================================
echo [Step 2/5] Building web application...
echo ============================================
echo.

call npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Web build failed!
    echo Check the errors above.
    pause
    exit /b 1
)

echo.
echo [OK] Web build completed successfully!

REM ============================================
REM Sync to Android
REM ============================================
echo.
echo ============================================
echo [Step 3/5] Syncing to Android...
echo ============================================
echo.

REM Try different methods to run capacitor sync
if exist "node_modules\.bin\cap.cmd" (
    call node_modules\.bin\cap.cmd sync android
) else if exist "node_modules\@capacitor\cli\dist\index.js" (
    node node_modules\@capacitor\cli\dist\index.js sync android
) else (
    echo WARNING: Could not find Capacitor CLI
    echo Skipping sync step. Files should still be there from previous sync.
    echo If you get errors, run manually: npx cap sync android
    timeout /t 3 >nul
)

echo.
echo [OK] Android sync completed!

REM ============================================
REM Build APK
REM ============================================
echo.
echo ============================================
echo [Step 4/5] Building signed release APK...
echo ============================================
echo.

cd android

echo Cleaning previous builds...
call gradlew clean

if errorlevel 1 (
    echo.
    echo ERROR: Gradle clean failed!
    cd ..
    pause
    exit /b 1
)

echo.
echo Building release APK (this may take a few minutes)...
call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ============================================
    echo BUILD FAILED!
    echo ============================================
    echo.
    echo Common issues:
    echo   - Java version mismatch (need Java 17)
    echo   - Keystore file not found
    echo   - Gradle configuration error
    echo.
    echo Check the error messages above for details.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [OK] APK built successfully!

REM ============================================
REM Copy APK
REM ============================================
echo.
echo ============================================
echo [Step 5/5] Copying APK to easy location...
echo ============================================
echo.

set "APK_SOURCE=android\app\build\outputs\apk\release\app-release.apk"
set "APK_DEST=QMAZ-Project-Map-v%GRADLE_VERSION%.apk"

if not exist "%APK_SOURCE%" (
    echo ERROR: APK not found at %APK_SOURCE%
    echo Build may have failed silently.
    pause
    exit /b 1
)

copy /Y "%APK_SOURCE%" "%APK_DEST%"

echo.
echo [OK] APK copied to: %APK_DEST%

REM ============================================
REM Success!
REM ============================================
echo.
echo ============================================
echo SUCCESS! APK Built!
echo ============================================
echo.
echo APK Location:
echo   %CD%\%APK_DEST%
echo.
echo File Size:
for %%A in ("%APK_DEST%") do echo   %%~zA bytes (%%~zA / 1048576 = MB)
echo.
echo Version: %GRADLE_VERSION%
echo.
echo ============================================
echo Next Steps:
echo ============================================
echo.
echo 1. INSTALL ON DEVICE:
echo    - Copy %APK_DEST% to your Android device
echo    - Install it (replace old version)
echo.
echo 2. TEST UPDATE SYSTEM:
echo    - Open the app
echo    - Wait 2 seconds
echo    - Watch for toast notifications
echo    - Should see: "Checking for updates..."
echo    - Then: "Update Found!" (if update available)
echo    - Then: Big slide-down notification!
echo.
echo 3. TO RELEASE UPDATE:
echo    - Copy %APK_DEST% to your GitHub Pages repo
echo    - Rename to: app-release.apk
echo    - Update update.json with new version
echo    - Push to GitHub
echo    - Wait 2-3 minutes for deployment
echo.
echo ============================================
echo.

explorer /select,"%CD%\%APK_DEST%"

echo.
echo Press any key to exit...
pause >nul

