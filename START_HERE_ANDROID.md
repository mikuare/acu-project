# 🚀 START HERE: Build Your Android APK

## Quick Start Guide for ACU Project Map

---

## 🎯 What You're About To Do

Convert your web app into a **native Android APK** that can:
- ✅ Be installed on Android phones/tablets
- ✅ Work like a native app
- ✅ Be published on Google Play Store
- ✅ Access device features (camera, GPS, etc.)

---

## ⚡ Super Quick Start (5 Steps)

### **Step 1:** Open the Main Menu

**Double-click:** `BUILD-ANDROID-APK.bat`

This opens an interactive menu with all options.

### **Step 2:** Install Capacitor

From the menu, select **[1] Install Capacitor**

⏱️ Time: ~3 minutes

### **Step 3:** Setup Android Project

From the menu, select **[2] Setup Android Project**

⏱️ Time: ~10 minutes

**You'll be asked:**
- App Name: `ACU Project Map` (or your choice)
- App ID: `com.acu.projectmap` (important!)

### **Step 4:** Build Test APK

From the menu, select **[3] Build DEBUG APK**

⏱️ Time: ~10 minutes

**Output:** `android\app\build\outputs\apk\debug\app-debug.apk`

### **Step 5:** Install and Test

Transfer the APK to your phone and install it!

---

## 🎉 That's It!

You now have a working Android APK!

**For Google Play Store release**, continue with steps 4-5 from the menu.

---

## 📚 Full Documentation

- **ANDROID_APK_BUILD_GUIDE.md** - Complete step-by-step guide
- **KEYSTORE_INFO_TEMPLATE.txt** - Template to save your signing info

---

## 🔑 Important When Creating Release APK

### When you select **[4] Create Signing Keystore**, you'll be asked:

```
QUESTION                          | EXAMPLE ANSWER
----------------------------------|---------------------------
Keystore password?               | MySecure123! (your choice)
Key alias?                       | acu-project-map-key (default)
Key password?                    | (same as keystore or different)
Your name?                       | Juan Dela Cruz
Organizational unit?             | Development Team
Organization?                    | ACU
City?                           | Manila
State?                          | Metro Manila
Country code?                    | PH
```

### ⚠️ CRITICAL: Save This Information!

After creating the keystore:
1. Open `KEYSTORE_INFO_TEMPLATE.txt`
2. Fill it out with your information
3. Save it somewhere SAFE
4. **You NEED this for ALL future app updates!**

---

## 🎨 Customization Options

### Change App Name
Edit: `capacitor.config.ts`
```typescript
appName: 'Your App Name Here',
```

### Change App ID
Edit: `capacitor.config.ts`
```typescript
appId: 'com.yourcompany.yourapp',
```
⚠️ Do this BEFORE step 2!

### Change Colors
Edit: `capacitor.config.ts`
```typescript
plugins: {
  SplashScreen: {
    backgroundColor: '#1e40af',  // Your color
  }
}
```

---

## 📱 Testing Your APK

### On Your Phone:

1. **Enable Installation:**
   - Settings → Security
   - Enable "Unknown Sources" or "Install Unknown Apps"

2. **Transfer APK:**
   - Copy `app-debug.apk` to your phone
   - Via USB, email, or cloud storage

3. **Install:**
   - Tap the APK file
   - Click "Install"
   - Open the app!

4. **Test Everything:**
   - Map works?
   - Authentication works?
   - Project submission works?
   - Camera works?

---

## 🏪 Publishing to Google Play Store

### After you have a working debug APK:

1. **Create Release APK:**
   - Menu option [4] Create Signing Keystore
   - Menu option [5] Build RELEASE APK

2. **Sign Up for Google Play Console:**
   - https://play.google.com/console
   - Cost: $25 (one-time)

3. **Create App & Upload APK:**
   - Follow the Play Console wizard
   - Upload your `app-release.apk`

4. **Fill Required Info:**
   - App description
   - Screenshots
   - Privacy policy
   - Content rating

5. **Submit for Review:**
   - Google reviews in 1-7 days
   - You'll receive approval email

---

## 🔄 Updating Your App

### When you make changes to your web code:

1. **Update the code**
2. **From menu, select [8] Update App**
3. **Build new APK:**
   - [3] for debug (testing)
   - [5] for release (Play Store)
4. **Increment version** in `android/app/build.gradle`:
   ```gradle
   versionCode 2      // Was 1, now 2
   versionName "1.1"  // Was "1.0", now "1.1"
   ```

---

## 🐛 Common Issues

### "Java not found"
**Fix:** Install Java JDK 11 or higher

### "Android SDK not found"
**Fix:** Install via Android Studio → SDK Manager

### "Build failed"
**Fix:** 
1. Close and reopen terminal
2. Run [2] Setup again
3. Check `npx cap doctor` for issues

### "Keystore password wrong"
**Fix:** Check your saved password in `KEYSTORE_INFO_TEMPLATE.txt`

---

## 📊 What Gets Created

```
your-project/
├── android/                    ← Android project folder
│   ├── app/
│   │   └── build/
│   │       └── outputs/
│   │           └── apk/
│   │               ├── debug/
│   │               │   └── app-debug.apk      ← Test this
│   │               └── release/
│   │                   └── app-release.apk    ← Upload this
│   └── keystores/
│       └── release-key.jks     ← SAVE THIS!
├── capacitor.config.ts         ← App configuration
└── BUILD-ANDROID-APK.bat       ← Main menu
```

---

## ✅ Checklist

### Before You Start:
- [ ] Android Studio installed
- [ ] Java JDK installed
- [ ] Your web app works correctly

### For First APK:
- [ ] Ran option [1] - Install Capacitor
- [ ] Ran option [2] - Setup Android
- [ ] Ran option [3] - Build Debug APK
- [ ] Tested APK on phone
- [ ] Everything works!

### For Play Store:
- [ ] Ran option [4] - Create Keystore
- [ ] **SAVED keystore info securely**
- [ ] Configured signing in build.gradle
- [ ] Ran option [5] - Build Release APK
- [ ] Created Play Console account
- [ ] Prepared app description
- [ ] Prepared screenshots (2+ required)
- [ ] Uploaded APK
- [ ] Submitted for review

---

## 🎯 Success Indicators

### You'll know it's working when:

✅ No errors in terminal
✅ APK file exists in `android/app/build/outputs/apk/`
✅ APK installs on your phone
✅ App opens without crashing
✅ All features work (map, auth, projects)
✅ App icon shows on phone

---

## 📞 Need Help?

1. **Check:** `ANDROID_APK_BUILD_GUIDE.md` (detailed guide)
2. **Run:** `npx cap doctor` (diagnoses issues)
3. **Check:** Android Studio logs if app crashes
4. **Search:** Capacitor documentation

---

## 🎉 Ready to Start?

**Just double-click:** `BUILD-ANDROID-APK.bat`

And follow the menu options in order:
1. Install Capacitor
2. Setup Android Project  
3. Build DEBUG APK
4. Test on your phone
5. (Optional) Create keystore for Play Store
6. (Optional) Build RELEASE APK
7. (Optional) Publish to Play Store

**Good luck! 🚀**

---

## 💡 Pro Tips

1. **Always test debug APK first** before building release
2. **Save keystore info immediately** after creation
3. **Keep backups** of your keystore file
4. **Test on real device**, not just emulator
5. **Increment version** for each new build
6. **Read Play Store policies** before publishing

---

**Total time for first build:** ~30 minutes
**Subsequent builds:** ~5-10 minutes

Let's build your app! 🎊

