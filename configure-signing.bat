@echo off
echo ============================================
echo Configure Android Signing
echo ============================================
echo.

echo This script will help you configure signing for your release APK.
echo.
echo You need to manually edit: android\app\build.gradle
echo.
echo Add this configuration AFTER you create the keystore:
echo.
echo ============================================
echo COPY THIS CONFIGURATION:
echo ============================================
echo.
echo android {
echo     ...
echo     signingConfigs {
echo         release {
echo             storeFile file('../keystores/release-key.jks')
echo             storePassword 'YOUR_KEYSTORE_PASSWORD'
echo             keyAlias 'acu-project-map-key'
echo             keyPassword 'YOUR_KEY_PASSWORD'
echo         }
echo     }
echo     buildTypes {
echo         release {
echo             signingConfig signingConfigs.release
echo             minifyEnabled false
echo             proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
echo         }
echo     }
echo }
echo.
echo ============================================
echo.
echo IMPORTANT: Replace:
echo - YOUR_KEYSTORE_PASSWORD with your actual keystore password
echo - YOUR_KEY_PASSWORD with your actual key password
echo.
echo Or for better security, use environment variables or gradle.properties
echo.
pause

