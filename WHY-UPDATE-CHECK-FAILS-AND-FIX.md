# 🔍 Why "Update Check Failed" Still Happens

## Common Causes & Solutions

### **Cause 1: Network Security Config Not Applied**

**Problem:** The `network_security_config.xml` file exists but wasn't synced to the Android build.

**Solution:**
```bash
# Sync changes
npx cap sync android

# OR manually copy
# The file should be at: android/app/src/main/res/xml/network_security_config.xml
```

Then rebuild:
```bash
cd android
gradlew clean
gradlew assembleRelease
```

**How to verify:** After installing the APK, the toast should show a different error if network config is wrong.

---

### **Cause 2: HTTPS Certificate Issue**

**Problem:** GitHub Pages uses HTTPS. Android might not trust the certificate.

**Solution:** Updated `network_security_config.xml` to explicitly trust system certificates for `github.io` domain.

---

### **Cause 3: Fetch API Not Working on Android**

**Problem:** Some Android versions have issues with the Fetch API.

**Solution:** Let me add a fallback using XMLHttpRequest.

---

### **Cause 4: CORS (Cross-Origin Resource Sharing)**

**Problem:** Android WebView blocks cross-origin requests.

**Solution:** GitHub Pages should send correct CORS headers. But we can also try adding a proxy or using native HTTP client.

---

### **Cause 5: App Not Using Native Platform**

**Problem:** The app thinks it's running on web instead of native.

**Solution:** Check the toast message:
- If it says "Web/PWA detected" → Not running as native APK
- If it says "Update check failed" → Network issue

---

## 🔧 Additional Fixes Applied

### **1. Maximum Z-Index**

Changed notification z-index to `2147483647` (the absolute maximum in CSS).

**Before:**
```typescript
zIndex: 999999999
```

**After:**
```typescript
zIndex: 2147483647  // Maximum possible value
```

### **2. Render at Root Level**

Moved `UpdatePrompt` OUTSIDE all providers in `App.tsx`.

**Before:** Inside QueryClientProvider, ThemeProvider, etc.
**After:** At the absolute root of the app

This ensures it's not affected by any parent styles or z-index contexts.

### **3. Fixed Positioning**

Added explicit `position: 'fixed'` in inline styles (not just className) to ensure it works.

---

## 🎯 Try These Debug Steps

### **Debug Step 1: Check Platform Detection**

After opening the app, check the toast:

**If you see:** "🌐 Web/PWA detected"
→ **Problem:** App is not running as native
→ **Solution:** Make sure you installed the APK file, not using browser

**If you see:** "🔍 Checking for updates..."
→ **Good:** App is running as native
→ Continue to next step

### **Debug Step 2: Check Network Error Details**

**If you see:** "❌ Update Check Failed: Error: failed to fetch"
→ **Problem:** Network request blocked
→ **Solution:** This is what we're fixing with network config

**If you see:** "❌ Update Check Failed: Error: Network request failed"
→ **Problem:** Different network error
→ **Solution:** Check internet connection

**If you see:** "❌ Update Check Failed: Error: 404 Not Found"
→ **Problem:** URL is wrong or GitHub Pages down
→ **Solution:** Verify URL in browser

### **Debug Step 3: Test on Different Network**

Sometimes corporate WiFi or mobile networks block GitHub Pages.

**Try:**
1. Switch from WiFi to mobile data
2. Or vice versa
3. Test if that changes the error

---

## 🚀 Automated Build Script

I created: `BUILD-AND-TEST-UPDATE-SYSTEM.bat`

**This script:**
1. ✅ Checks version numbers match
2. ✅ Builds web app (`npm run build`)
3. ✅ Syncs to Android
4. ✅ Cleans previous builds
5. ✅ Builds signed release APK
6. ✅ Copies APK to easy location with version number
7. ✅ Opens folder with the APK
8. ✅ Shows next steps

**To use:**
1. Double-click `BUILD-AND-TEST-UPDATE-SYSTEM.bat`
2. Wait for it to complete
3. Install the APK it creates
4. Test!

---

## 📋 Complete Verification Checklist

Before saying "it still doesn't work", verify ALL of these:

**Files exist:**
- [ ] `android/app/src/main/res/xml/network_security_config.xml` exists
- [ ] `AndroidManifest.xml` has `android:networkSecurityConfig="@xml/network_security_config"`
- [ ] `AndroidManifest.xml` has `android:usesCleartextTraffic="true"`

**Code settings:**
- [ ] `src/hooks/useUpdateCheck.ts` has `CURRENT_VERSION_CODE = 1`
- [ ] `android/app/build.gradle` has `versionCode 1`
- [ ] These two numbers MATCH

**Build process:**
- [ ] Ran `npm run build` successfully
- [ ] Ran `npx cap sync android` (or used the .bat script)
- [ ] Ran `gradlew clean` to clear old files
- [ ] Ran `gradlew assembleRelease` successfully
- [ ] New APK was created with today's timestamp

**GitHub Pages:**
- [ ] https://mikuare.github.io/qmaz-project-update/update.json shows `versionCode: 2`
- [ ] https://mikuare.github.io/qmaz-project-update/app-release.apk downloads APK
- [ ] Both URLs work in phone's browser

**Testing:**
- [ ] Installed the NEW APK (not old one)
- [ ] Force closed the app before testing
- [ ] Phone has internet connection (test in browser)
- [ ] Waited at least 3 seconds after opening
- [ ] Looked for toast notifications at bottom of screen

---

## 💡 If Still Doesn't Work

### **Option A: Try Native HTTP Request**

If Fetch API is blocked, we can use Capacitor's HTTP plugin instead.

Tell me if you want me to implement this.

### **Option B: Simplify Network Config**

Remove all network security config and just allow everything (less secure but works).

Tell me if you want me to try this.

### **Option C: Use Different Update Method**

Instead of checking on app startup, add a manual "Check for Updates" button.

Tell me if you want this approach.

---

## 🎯 Next Steps

1. **Run the automated build script:**
   ```
   BUILD-AND-TEST-UPDATE-SYSTEM.bat
   ```

2. **Install the new APK it creates**

3. **Test and tell me:**
   - What toasts do you see?
   - At what step does it fail?
   - "Checking for updates..." → "Update check failed"?
   - Or different message?

4. **If notification appears but is hidden behind map:**
   - Tell me and I'll make it even MORE visible
   - The z-index is now maximum, and it's at root level
   - Should definitely be visible now

**Run the .bat script now and tell me what happens!** 🚀

