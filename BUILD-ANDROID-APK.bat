    @echo off
title Android APK Build - ACU Project Map
color 0A

:MENU
cls
echo.
echo ============================================
echo    ACU PROJECT MAP - ANDROID APK BUILDER
echo ============================================
echo.
echo Select an option:
echo.
echo [1] Install Capacitor (First time setup)
echo [2] Setup Android Project (After install)
echo [3] Build DEBUG APK (For testing)
echo [4] Create Signing Keystore (For release)
echo [5] Build RELEASE APK (For Play Store)
echo [6] Open in Android Studio
echo [7] View Guide (Opens documentation)
echo [8] Update App (Sync changes to Android)
echo [0] Exit
echo.
echo ============================================
echo.

set /p choice="Enter your choice (0-8): "

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto SETUP
if "%choice%"=="3" goto DEBUG
if "%choice%"=="4" goto KEYSTORE
if "%choice%"=="5" goto RELEASE
if "%choice%"=="6" goto STUDIO
if "%choice%"=="7" goto GUIDE
if "%choice%"=="8" goto UPDATE
if "%choice%"=="0" goto EXIT

echo Invalid choice! Please try again.
timeout /t 2 >nul
goto MENU

:INSTALL
cls
echo.
echo Running: Install Capacitor...
echo.
call 1-install-capacitor.bat
pause
goto MENU

:SETUP
cls
echo.
echo Running: Setup Android Project...
echo.
call 2-setup-capacitor.bat
pause
goto MENU

:DEBUG
cls
echo.
echo Running: Build DEBUG APK...
echo.
call 3-build-apk-debug.bat
pause
goto MENU

:KEYSTORE
cls
echo.
echo Running: Create Signing Keystore...
echo.
call 4-setup-keystore.bat
pause
goto MENU

:RELEASE
cls
echo.
echo Running: Build RELEASE APK...
echo.
call 5-build-apk-release.bat
pause
goto MENU

:STUDIO
cls
echo.
echo Opening Android Studio...
echo.
call 6-open-android-studio.bat
pause
goto MENU

:GUIDE
cls
echo.
echo Opening documentation...
echo.
start ANDROID_APK_BUILD_GUIDE.md
echo.
echo Guide opened in your default markdown viewer.
pause
goto MENU

:UPDATE
cls
echo.
echo ============================================
echo Updating Android App
echo ============================================
echo.
echo This will sync your latest web changes to Android.
echo.
pause

echo Step 1: Building web app...
call npm run build

echo.
echo Step 2: Syncing to Android...
call npx cap sync android

echo.
echo ============================================
echo Update Complete!
echo ============================================
echo.
echo Next: Build a new APK to test changes
echo.
pause
goto MENU

:EXIT
cls
echo.
echo ============================================
echo Thank you for using ACU Project Map Builder!
echo ============================================
echo.
echo Quick Reference:
echo - Debug APK: android\app\build\outputs\apk\debug\app-debug.apk
echo - Release APK: android\app\build\outputs\apk\release\app-release.apk
echo - Keystore: android\keystores\release-key.jks
echo.
echo Documentation: ANDROID_APK_BUILD_GUIDE.md
echo.
timeout /t 3
exit

