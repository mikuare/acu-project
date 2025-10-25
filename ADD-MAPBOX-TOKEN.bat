@echo off
echo ============================================
echo ADD MAPBOX TOKEN TO YOUR PROJECT
echo ============================================
echo.
echo This will open the config file where you need
echo to add your Mapbox token.
echo.
echo If you don't have a token yet:
echo 1. Read: GET-MAPBOX-TOKEN.txt
echo 2. Get your free token from mapbox.com
echo 3. Come back and run this script again
echo.
pause

echo.
echo Opening mapbox config file...
echo.

if exist "src\config\mapbox.ts" (
    notepad "src\config\mapbox.ts"
    
    echo.
    echo ============================================
    echo DID YOU ADD YOUR TOKEN?
    echo ============================================
    echo.
    echo If YES:
    echo 1. Save the file (Ctrl+S)
    echo 2. Close Notepad
    echo 3. Run: REBUILD-WITH-MAPBOX.bat
    echo.
    echo If NO:
    echo 1. Get your token first (see GET-MAPBOX-TOKEN.txt)
    echo 2. Run this script again
    echo.
    echo ============================================
    echo.
    echo What to change:
    echo ============================================
    echo.
    echo BEFORE:
    echo export const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';
    echo.
    echo AFTER:
    echo export const MAPBOX_TOKEN = 'pk.eyJ1abc123...';
    echo                              ^
    echo                              Your actual token here
    echo.
    echo ============================================
    echo.
) else (
    echo [ERROR] Config file not found!
    echo Expected: src\config\mapbox.ts
    echo.
)

pause

