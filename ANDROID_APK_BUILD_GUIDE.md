# 📱 Android APK Build Guide

## Complete Guide to Convert Your Web App to Native Android APK

---

## 🎯 Overview

This guide will help you:
1. ✅ Install Capacitor (web-to-native bridge)
2. ✅ Set up Android project
3. ✅ Build DEBUG APK (for testing)
4. ✅ Create signing keystore (for release)
5. ✅ Build RELEASE APK (for Play Store)

---

## 📋 Prerequisites

### ✅ What You Already Have:
- ✅ Node.js and npm installed
- ✅ Android Studio installed
- ✅ Your web app ready

### ⚙️ What You Need to Check:

1. **Java JDK** (required for Android builds):
   - Open command prompt
   - Run: `java -version`
   - Should show version 11 or higher
   - If not installed: https://adoptium.net/

2. **Android SDK** (installed with Android Studio):
   - Open Android Studio
   - Tools → SDK Manager
   - Ensure Android SDK is installed

3. **Environment Variables**:
   - `ANDROID_HOME` should point to Android SDK
   - Usually: `C:\Users\YourName\AppData\Local\Android\Sdk`

---

## 🚀 Step-by-Step Process

### **Step 1: Install Capacitor**

**Run:** `1-install-capacitor.bat`

```batch
Double-click: 1-install-capacitor.bat
```

**What it does:**
- Installs @capacitor/core
- Installs @capacitor/cli
- Installs @capacitor/android
- Installs useful plugins (splash screen, status bar, etc.)

**Time:** ~2-3 minutes

---

### **Step 2: Set Up Android Project**

**Run:** `2-setup-capacitor.bat`

```batch
Double-click: 2-setup-capacitor.bat
```

**You'll be asked to prepare:**

1. **APP NAME**: What users will see
   - Example: "ACU Project Map"
   - Can be changed later

2. **APP ID**: Unique identifier
   - Example: "com.acu.projectmap"
   - ⚠️ **CANNOT be changed later!**
   - Format: reverse domain (com.yourcompany.appname)

**What it does:**
- Builds your web app (`npm run build`)
- Initializes Capacitor
- Creates Android project folder
- Syncs web app to Android
- Copies all assets

**Time:** ~5-10 minutes

**Output:** `android/` folder created

---

### **Step 3A: Build Debug APK (Testing)**

**Run:** `3-build-apk-debug.bat`

```batch
Double-click: 3-build-apk-debug.bat
```

**What it does:**
- Builds an unsigned APK
- For testing only
- NOT for Google Play Store

**Time:** ~5-15 minutes (first build is slower)

**Output:**
```
android\app\build\outputs\apk\debug\app-debug.apk
```

**Use this APK to:**
- ✅ Test on your Android device
- ✅ Share with testers
- ✅ Verify everything works
- ❌ NOT for Play Store release

---

### **Step 3B: Create Signing Keystore (For Release)**

**Run:** `4-setup-keystore.bat`

```batch
Double-click: 4-setup-keystore.bat
```

**🔐 IMPORTANT: You'll be prompted for:**

1. **Keystore password**
   - Choose a STRONG password
   - You'll need to enter it TWICE
   - Example: `MySecurePassword123!`

2. **Key alias**
   - Default: `acu-project-map-key`
   - Just press Enter to use default

3. **Key password**
   - Can be same as keystore password
   - Or different for extra security

4. **Your information**:
   ```
   What is your first and last name?
   > Your Name  (e.g., Juan Dela Cruz)

   What is the name of your organizational unit?
   > Development Team  (or just press Enter)

   What is the name of your organization?
   > ACU  (or your organization name)

   What is the name of your City or Locality?
   > Manila  (your city)

   What is the name of your State or Province?
   > Metro Manila  (your state/province)

   What is the two-letter country code for this unit?
   > PH  (for Philippines)
   ```

5. **Confirmation**:
   ```
   Is this correct?
   > yes  (type 'yes' and press Enter)
   ```

**⚠️ CRITICAL: Write This Down NOW!**

After completion, **IMMEDIATELY** save this information somewhere safe:

```
📝 SAVE THIS INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keystore Path: android\keystores\release-key.jks
Keystore Password: [YOUR PASSWORD]
Key Alias: acu-project-map-key
Key Password: [YOUR KEY PASSWORD]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ YOU WILL NEED THIS FOR EVERY APP UPDATE!
⚠️ IF YOU LOSE THIS, YOU CANNOT UPDATE YOUR APP!
⚠️ STORE IN A PASSWORD MANAGER OR SECURE LOCATION!
```

**What it creates:**
- `android/keystores/release-key.jks` (your signing key)

**Time:** ~2 minutes

---

### **Step 4: Configure Signing (One-time setup)**

After creating the keystore, you need to configure Android to use it.

**Option A: Manual Configuration**

1. Open: `android\app\build.gradle`

2. Find the `android {` section

3. Add this BEFORE the `buildTypes` section:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            storeFile file('../keystores/release-key.jks')
            storePassword 'YOUR_KEYSTORE_PASSWORD'
            keyAlias 'acu-project-map-key'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

4. **Replace:**
   - `YOUR_KEYSTORE_PASSWORD` with your actual keystore password
   - `YOUR_KEY_PASSWORD` with your actual key password

5. Save the file

**Option B: Using gradle.properties (More Secure)**

1. Create `android/gradle.properties` (if not exists)

2. Add:
```properties
RELEASE_STORE_FILE=../keystores/release-key.jks
RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
RELEASE_KEY_ALIAS=acu-project-map-key
RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

3. In `build.gradle`, use:
```gradle
signingConfigs {
    release {
        storeFile file(RELEASE_STORE_FILE)
        storePassword RELEASE_STORE_PASSWORD
        keyAlias RELEASE_KEY_ALIAS
        keyPassword RELEASE_KEY_PASSWORD
    }
}
```

---

### **Step 5: Build Release APK**

**Run:** `5-build-apk-release.bat`

```batch
Double-click: 5-build-apk-release.bat
```

**What it does:**
- Syncs latest web app changes
- Builds a SIGNED release APK
- Ready for Google Play Store!

**Time:** ~5-15 minutes

**Output:**
```
android\app\build\outputs\apk\release\app-release.apk
```

**This APK is:**
- ✅ Signed with your keystore
- ✅ Ready for Play Store upload
- ✅ Optimized for production
- ✅ Can be distributed to users

---

## 🎨 Customization

### **Change App Name**

Edit: `capacitor.config.ts`
```typescript
appName: 'ACU Project Map',  // Change this
```

Then re-sync:
```batch
npx cap sync android
```

### **Change App Icon**

1. Create icons (different sizes):
   - 192x192 px (normal)
   - 512x512 px (high-res)

2. Place in: `android\app\src\main\res\`
   - `mipmap-hdpi/`
   - `mipmap-mdpi/`
   - `mipmap-xhdpi/`
   - `mipmap-xxhdpi/`
   - `mipmap-xxxhdpi/`

3. Or use: https://icon.kitchen/ (auto-generates all sizes)

### **Change Splash Screen**

Edit: `capacitor.config.ts`
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#1e40af',  // Change color
    showSpinner: true,
    spinnerColor: '#ffffff'  // Change spinner
  }
}
```

### **Change Package Name (App ID)**

⚠️ **Complex process, better to do it right the first time!**

If you must change it:
1. Edit `capacitor.config.ts`
2. Run `npx cap sync`
3. Manually update `android/app/build.gradle`
4. Update package names in Java/Kotlin files

---

## 🧪 Testing Your APK

### **Install on Android Device:**

1. **Enable Developer Options:**
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back → Developer Options
   - Enable "USB Debugging"

2. **Transfer APK:**
   - Copy `app-debug.apk` or `app-release.apk` to your phone
   - Or use `adb install app-release.apk`

3. **Install:**
   - Tap the APK file
   - Click "Install"
   - Allow installation from unknown sources if prompted

4. **Test:**
   - Open the app
   - Test all features
   - Check map, authentication, everything!

---

## 🎯 Opening in Android Studio

**Run:** `6-open-android-studio.bat`

```batch
Double-click: 6-open-android-studio.bat
```

**From Android Studio you can:**
- Run on emulator
- Debug the app
- View logs
- Customize native code
- Build APK with UI

---

## 📦 App Updates

### **When you update your web app:**

1. **Update web code** (your React app)

2. **Build web app:**
   ```batch
   npm run build
   ```

3. **Sync to Android:**
   ```batch
   npx cap sync android
   ```

4. **Build new APK:**
   ```batch
   Run: 3-build-apk-debug.bat (for testing)
   OR
   Run: 5-build-apk-release.bat (for release)
   ```

5. **Increment version** in `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment this
   versionName "1.1"  // Update version
   ```

---

## 🏪 Publishing to Google Play Store

### **Prerequisites:**

1. **Google Play Console Account**
   - Cost: $25 (one-time fee)
   - Sign up: https://play.google.com/console

2. **Release APK**
   - Built with `5-build-apk-release.bat`
   - Signed with your keystore

### **Steps:**

1. **Create App in Play Console**
   - Click "Create App"
   - Fill in app details

2. **Upload APK**
   - Go to "Production" → "Create Release"
   - Upload `app-release.apk`

3. **Fill Store Listing**
   - App description
   - Screenshots (at least 2)
   - Feature graphic
   - App icon

4. **Content Rating**
   - Complete questionnaire
   - Get rating

5. **Pricing & Distribution**
   - Select countries
   - Set price (Free or Paid)

6. **Submit for Review**
   - Review can take 1-7 days
   - You'll be notified via email

---

## 🐛 Troubleshooting

### **Issue: "Java not found"**

**Solution:**
1. Install Java JDK 11 or higher
2. Set JAVA_HOME environment variable
3. Restart terminal

### **Issue: "Android SDK not found"**

**Solution:**
1. Open Android Studio
2. Tools → SDK Manager
3. Install Android SDK
4. Set ANDROID_HOME environment variable

### **Issue: "Build failed"**

**Solution:**
1. Check error message
2. Ensure Android SDK is installed
3. Run `npx cap sync android`
4. Try `npx cap doctor` for diagnostics

### **Issue: "Keystore password incorrect"**

**Solution:**
- Double-check your saved password
- If lost, you'll need to create a new keystore
- ⚠️ New keystore = new app (cannot update existing)

### **Issue: "App crashes on Android"**

**Solution:**
1. Check Android logs:
   ```batch
   adb logcat
   ```
2. Test in Android Studio with debugger
3. Ensure all URLs use HTTPS
4. Check Capacitor plugin compatibility

---

## 📊 File Structure After Setup

```
your-project/
├── android/                          # Android project
│   ├── app/
│   │   ├── build/
│   │   │   └── outputs/
│   │   │       └── apk/
│   │   │           ├── debug/
│   │   │           │   └── app-debug.apk        ← Debug APK
│   │   │           └── release/
│   │   │               └── app-release.apk      ← Release APK
│   │   ├── src/
│   │   └── build.gradle              # Build configuration
│   ├── keystores/
│   │   └── release-key.jks           # Your signing key
│   └── gradle.properties             # Gradle properties
├── dist/                             # Built web app
├── capacitor.config.ts               # Capacitor config
└── [build scripts].bat               # Helper scripts
```

---

## ✅ Checklist

### Before Building:
- [ ] Java JDK installed
- [ ] Android Studio installed
- [ ] Android SDK installed
- [ ] Environment variables set
- [ ] Web app works correctly

### For Debug APK:
- [ ] Ran `1-install-capacitor.bat`
- [ ] Ran `2-setup-capacitor.bat`
- [ ] Ran `3-build-apk-debug.bat`
- [ ] APK file created
- [ ] Tested on device

### For Release APK:
- [ ] Ran `4-setup-keystore.bat`
- [ ] Saved keystore information
- [ ] Configured signing in build.gradle
- [ ] Ran `5-build-apk-release.bat`
- [ ] APK file created and signed
- [ ] Tested on device

### For Play Store:
- [ ] Google Play Console account created
- [ ] App version incremented
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Release APK uploaded
- [ ] Content rating completed
- [ ] Submitted for review

---

## 🎉 Summary

**Quick Command Sequence:**

```batch
1. Double-click: 1-install-capacitor.bat
2. Double-click: 2-setup-capacitor.bat
3. For testing: 3-build-apk-debug.bat
4. For release: 4-setup-keystore.bat
5. Configure signing in build.gradle
6. Double-click: 5-build-apk-release.bat
7. Your APK is ready!
```

**Total time:**
- First time setup: ~30-45 minutes
- Subsequent builds: ~5-10 minutes

---

## 📞 Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Docs**: https://developer.android.com/
- **Play Console Help**: https://support.google.com/googleplay/android-developer

---

## 🔑 Important Reminders

1. **SAVE YOUR KEYSTORE INFORMATION!**
   - You cannot recover it
   - You cannot update your app without it
   - Store it in multiple safe locations

2. **Test Before Release**
   - Always test debug APK first
   - Test on real devices
   - Check all features work

3. **Version Control**
   - Don't commit keystore to Git
   - Don't commit passwords
   - Add `android/keystores/` to `.gitignore`

4. **Keep Backups**
   - Backup your keystore file
   - Backup your passwords
   - Store securely (password manager)

---

**You're ready to build your Android APK! 🚀**

Start with Step 1 and follow the scripts in order!

