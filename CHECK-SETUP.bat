@echo off
echo ============================================
echo Setup Diagnostic Tool
echo ============================================
echo.
echo Checking your build environment...
echo.

echo [1] Checking Java...
java -version 2>&1 | findstr "version"
if errorlevel 1 (
    echo [ERROR] Java not found!
) else (
    echo [OK] Java is installed
)

echo.
echo [2] Checking Node/NPM...
node -v 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found!
) else (
    echo [OK] Node.js is installed
)

echo.
echo [3] Checking keystore file...
if exist "android\keystores\release-key.jks" (
    echo [OK] Keystore found: android\keystores\release-key.jks
    dir "android\keystores\release-key.jks" | findstr "release-key.jks"
) else (
    echo [ERROR] Keystore NOT found!
    echo.
    echo Expected location: android\keystores\release-key.jks
    echo.
    echo Please check if you created the keystore.
    echo.
    echo Directory contents:
    if exist "android\keystores" (
        dir "android\keystores"
    ) else (
        echo android\keystores directory does not exist!
    )
)

echo.
echo [4] Checking gradle.properties...
if exist "android\gradle.properties" (
    echo [OK] gradle.properties found
    echo.
    echo Signing configuration:
    findstr "RELEASE_" android\gradle.properties
) else (
    echo [ERROR] gradle.properties not found!
)

echo.
echo [5] Checking Android project...
if exist "android\app\build.gradle" (
    echo [OK] Android project exists
) else (
    echo [ERROR] Android project not found!
)

echo.
echo [6] Checking dist folder...
if exist "dist" (
    echo [OK] dist folder exists (web app built)
) else (
    echo [WARNING] dist folder missing (need to build web app)
)

echo.
echo ============================================
echo Diagnostic Complete
echo ============================================
echo.
echo If everything shows [OK], you can run:
echo   BUILD-APK-SIMPLE.bat
echo.
echo If there are [ERROR]s, fix them first.
echo.
pause

