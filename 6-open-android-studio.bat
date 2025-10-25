@echo off
echo ============================================
echo Opening Android Studio
echo ============================================
echo.

echo Opening the Android project in Android Studio...
echo.
echo If Android Studio doesn't open automatically:
echo 1. Open Android Studio manually
echo 2. Click "Open an Existing Project"
echo 3. Navigate to: %CD%\android
echo 4. Click "OK"
echo.

call npx cap open android

echo.
echo From Android Studio, you can:
echo - Run the app on an emulator or device
echo - Debug the app
echo - Build release APK
echo - Customize the Android app
echo.
pause

