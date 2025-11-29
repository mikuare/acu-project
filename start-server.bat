@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         Starting ACU Project Map with Mapbox...             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Starting development server...
echo.

cd /d "%~dp0"
call npm run dev

pause

