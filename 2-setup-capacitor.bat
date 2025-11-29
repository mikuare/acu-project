@echo off
echo ============================================
echo Setting Up Capacitor Android Project
echo ============================================
echo.

echo IMPORTANT: Please prepare the following information:
echo.
echo 1. APP NAME: What should your app be called?
echo    Default: "ACU Project Map"
echo    (You can change this later in capacitor.config.ts)
echo.
echo 2. APP ID: Unique identifier for your app
echo    Default: "com.acu.projectmap"
echo    (This cannot be changed easily later!)
echo.
echo Press any key when ready...
pause > nul

echo.
echo Step 1: Building the web app...
call npm run build

echo.
echo Step 2: Initializing Capacitor (already configured)...
call npx cap init --web-dir=dist

echo.
echo Step 3: Adding Android platform...
call npx cap add android

echo.
echo Step 4: Syncing web app to Android...
call npx cap sync android

echo.
echo Step 5: Copying assets...
call npx cap copy android

echo.
echo ============================================
echo Capacitor Android Setup Complete!
echo ============================================
echo.
echo Your Android project is ready at: android/
echo.
echo Next steps:
echo 1. Run 3-build-apk-debug.bat to build a debug APK (for testing)
echo 2. Or run 4-setup-keystore.bat to create signing keys for release APK
echo.
pause

