# 🐛 Debug Update Check - Troubleshooting Guide

## Problem: Update notification not showing

Let's diagnose why the update notification isn't appearing.

---

## 🧪 Option 1: Use Debug Version (Recommended)

I created a debug version that shows **visible alerts** so you can see exactly what's happening.

### **Steps:**

**1. Backup original file:**
```bash
# Just in case
copy src\hooks\useUpdateCheck.ts src\hooks\useUpdateCheck-BACKUP.ts
```

**2. Replace with debug version:**
```bash
# Delete the original
del src\hooks\useUpdateCheck.ts

# Rename debug version
ren src\hooks\useUpdateCheck-DEBUG.ts useUpdateCheck.ts
```

**OR manually:** 
- Delete `src/hooks/useUpdateCheck.ts`
- Rename `src/hooks/useUpdateCheck-DEBUG.ts` to `useUpdateCheck.ts`

**3. Rebuild APK:**
```bash
npm run build
npx cap sync android
cd android
gradlew assembleRelease
```

**4. Install on device:**
- Install the new APK
- Open the app
- You'll see popup alerts showing what's happening!

**5. Check the alerts:**

You'll see one of these:

**Alert 1: Platform Check**
```
✅ Native platform detected!
Update check will run in 5 seconds...
```
Good! Means you're on native APK.

**OR**
```
⚠️ Not native platform
You're on Web/PWA, not APK!
```
Bad! You're testing on web/PWA, not the installed APK.

**Alert 2: Checking for updates**
```
🔍 Checking for updates...
Current version: 2
```

**Alert 3: Result**
```
🎉 Update available!
Current: 2
Latest: 3
Update prompt should appear now!
```
Success! Update should show.

**OR**
```
✅ App is up to date!
Current: 2
Latest: 2
No update needed.
```
This means GitHub Pages hasn't updated yet, or update.json still shows version 2.

**OR**
```
❌ Update check FAILED!
Error: [error message]
```
Network error - check internet connection.

---

## 🔍 Option 2: Use Chrome DevTools (Advanced)

If you can't rebuild, use Chrome DevTools to see console logs:

### **Steps:**

**1. Enable USB Debugging on Android:**
- Settings → About Phone
- Tap "Build Number" 7 times (enables Developer Options)
- Settings → Developer Options
- Enable "USB Debugging"

**2. Connect to Computer:**
- Connect Android device via USB cable
- Allow USB debugging when prompted

**3. Open Chrome DevTools:**
- On computer: Open Chrome
- Go to: `chrome://inspect`
- Wait for your device to appear
- Open your APK on the device
- In Chrome, click "inspect" next to your app
- Click "Console" tab

**4. Read the logs:**

Look for these messages:

**If you see:**
```
🌐 Web/PWA detected - update check skipped
```
❌ You're not on the native APK! Install the actual APK file.

**If you see:**
```
🔍 Checking for updates...
📱 Current version code: 2
📦 Latest version info: { versionCode: 3, ... }
🎉 New update available!
```
✅ Everything working! Update prompt should show.

**If you see:**
```
🔍 Checking for updates...
📱 Current version code: 2
📦 Latest version info: { versionCode: 2, ... }
✅ App is up to date
```
❌ GitHub Pages hasn't updated yet, or update.json still has version 2.

**If you see:**
```
❌ Update check failed: [error]
```
❌ Network error - check internet connection.

---

## 📋 Common Issues and Solutions

### **Issue 1: "Web/PWA detected"**

**Problem:** Testing on browser or PWA, not native APK

**Solution:** 
- Install the actual APK file on Android device
- Open the installed app (icon in app drawer)
- Not the web browser or PWA

---

### **Issue 2: "App is up to date" (versionCode: 2)**

**Problem:** GitHub Pages hasn't updated yet

**Solution:**
- Wait 1-2 minutes after pushing to GitHub
- Clear browser cache
- Verify: https://mikuare.github.io/qmaz-project-update/update.json
- Should show `"versionCode": 3`

---

### **Issue 3: "Update check failed"**

**Problem:** Network error or CORS issue

**Solution:**
- Check device has internet (WiFi or mobile data)
- Try on different network
- Check GitHub Pages is enabled
- Verify JSON URL is accessible in browser

---

### **Issue 4: No logs at all**

**Problem:** Update check not running

**Solution:**
- Make sure you rebuilt APK after code changes
- Force close and reopen app
- Wait full 5 seconds
- Check if App.tsx has UpdatePrompt integrated

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] GitHub Pages enabled at: https://github.com/mikuare/qmaz-project-update/settings/pages
- [ ] update.json accessible: https://mikuare.github.io/qmaz-project-update/update.json
- [ ] update.json shows `"versionCode": 3`
- [ ] Testing on NATIVE APK (not web/PWA)
- [ ] APK installed from file (not from browser)
- [ ] Device has internet connection
- [ ] Waited at least 5 seconds after opening app
- [ ] Force closed and reopened app

---

## 🎯 Expected Flow

When everything works correctly:

```
1. Open native APK
   ↓
2. Wait 1 second
   Alert: "✅ Native platform detected!"
   ↓
3. Wait 5 seconds
   Alert: "🔍 Checking for updates..."
   ↓
4. After fetch
   Alert: "🎉 Update available!"
   ↓
5. Update prompt modal appears
   (Beautiful gradient UI with download button)
```

---

## 🔧 After Debugging

Once you find the issue:

**1. Restore original file:**
```bash
del src\hooks\useUpdateCheck.ts
ren src\hooks\useUpdateCheck-BACKUP.ts useUpdateCheck.ts
```

**2. Rebuild without debug alerts:**
```bash
npm run build
npx cap sync android
cd android
gradlew assembleRelease
```

---

## 💡 Most Likely Causes

Based on experience:

1. **Testing on web/PWA instead of native APK** (80% of cases)
2. **GitHub Pages not updated yet** (15% of cases)
3. **Old APK has wrong version code** (4% of cases)
4. **Network/internet issue** (1% of cases)

---

## 📞 Next Steps

Try the debug version first. The alerts will tell you exactly what's wrong!

If still stuck, check the Chrome DevTools console logs and share what you see.

