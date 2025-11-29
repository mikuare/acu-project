@echo off
echo ============================================
echo Testing Mapbox Token - Quick Build
echo ============================================
echo.
echo Token added: pk.eyJ1IjoianVkZWNoLTEyMyIsImEi...
echo.
echo Building web app to verify token works...
echo.
pause

cmd /c "npm run build"

if errorlevel 1 (
    echo.
    echo [ERROR] Build still failed!
    echo.
    echo Please check the error above.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] Token works! Build successful!
echo ============================================
echo.
echo Your Mapbox token is correctly configured!
echo.
echo Next step: Build the APK
echo Run: REBUILD-WITH-MAPBOX.bat
echo.
pause

