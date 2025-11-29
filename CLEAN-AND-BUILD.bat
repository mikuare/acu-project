@echo off
echo ============================================
echo Clean Everything and Build Fresh APK
echo ============================================
echo.

echo This will:
echo 1. Stop all Gradle processes
echo 2. Clean all build files
echo 3. Rebuild web app
echo 4. Sync to Android
echo 5. Build release APK
echo.
echo This may take 5-10 minutes...
echo.
pause

echo.
echo Step 1: Stopping Gradle daemon...
cd android
call gradlew --stop
cd ..

echo.
echo Step 2: Cleaning all build files...
cd android
call gradlew clean
cd ..

echo.
echo Step 3: Building web app...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Web build failed!
    pause
    exit /b 1
)

echo.
echo Step 4: Syncing to Android...
call npx cap sync android

if errorlevel 1 (
    echo.
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo Step 5: Building Android Release APK...
echo (This may take a few minutes on first build)
echo.
cd android
call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ============================================
    echo ❌ BUILD FAILED!
    echo ============================================
    echo.
    echo Please check the error above.
    echo.
    echo If you see "invalid source release" errors:
    echo - Make sure Java 17 is installed
    echo - Run: java -version
    echo - Should show: java version "17.x.x"
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo ✅ BUILD SUCCESSFUL!
echo ============================================
echo.

set APK_PATH=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_PATH%" (
    echo Your APK is ready at:
    echo %APK_PATH%
    echo.
    
    for %%I in ("%APK_PATH%") do (
        set /a SIZE_MB=%%~zI/1024/1024
        echo File size: %%~zI bytes (~!SIZE_MB! MB)
    )
    
    echo.
    echo Opening folder...
    start "" "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ✅ DONE! Install app-release.apk on your Android phone!
) else (
    echo ⚠️ APK not found at expected location
)

echo.
pause

