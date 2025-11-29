@echo off
echo ============================================
echo Building DEBUG APK (for testing only)
echo ============================================
echo.

echo This will create an unsigned APK for testing.
echo NOT suitable for Google Play Store release.
echo.
echo Press any key to continue...
pause > nul

echo.
echo Step 1: Syncing latest changes to Android...
call npx cap sync android

echo.
echo Step 2: Building debug APK...
cd android
call gradlew assembleDebug
cd ..

echo.
echo ============================================
echo Debug APK Build Complete!
echo ============================================
echo.
echo Your APK is located at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can install this on your Android device for testing.
echo.
echo To build a RELEASE APK for Play Store:
echo Run 4-setup-keystore.bat first, then 5-build-apk-release.bat
echo.
pause

