@echo off
echo ============================================
echo Building RELEASE APK (signed for Play Store)
echo ============================================
echo.

echo This will build a signed APK ready for Google Play Store.
echo.
echo Make sure you have:
echo 1. Created a keystore (run 4-setup-keystore.bat first)
echo 2. Your keystore password ready
echo.
echo Press any key to continue...
pause > nul

echo.
echo Step 1: Syncing latest changes to Android...
call npx cap sync android

echo.
echo Step 2: Building release APK...
echo.
echo You will be prompted for your keystore password.
echo.

cd android
call gradlew assembleRelease
cd ..

echo.
echo ============================================
echo Release APK Build Complete!
echo ============================================
echo.
echo Your signed APK is located at:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo This APK is ready to upload to Google Play Store!
echo.
echo File size: ~10-20 MB (approximately)
echo.
echo Next steps:
echo 1. Test the APK on your device
echo 2. Upload to Google Play Console
echo 3. Fill in store listing information
echo 4. Submit for review
echo.
pause

