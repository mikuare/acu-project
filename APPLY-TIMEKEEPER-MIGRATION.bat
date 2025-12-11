@echo off
echo ====================================
echo Applying Timekeeper Name Migration
echo ====================================
echo.

echo This will add the timekeeper_name column to the project_implementations table.
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Supabase CLI is not installed or not in PATH.
    echo.
    echo Please apply this migration manually in Supabase Dashboard:
    echo 1. Go to https://supabase.com/dashboard
    echo 2. Select your project
    echo 3. Go to SQL Editor
    echo 4. Run the SQL from: supabase\migrations\20251211000000_add_timekeeper_name.sql
    echo.
    pause
    exit /b 1
)

echo Applying migration using Supabase CLI...
echo.

cd /d "%~dp0"
supabase db push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Migration applied successfully!
    echo ====================================
    echo.
    echo The timekeeper_name field is now ready to use.
    echo You can now save and view timekeeper information.
) else (
    echo.
    echo ====================================
    echo Migration failed!
    echo ====================================
    echo.
    echo Please apply manually in Supabase Dashboard.
)

echo.
pause
