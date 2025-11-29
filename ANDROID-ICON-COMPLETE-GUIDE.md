# 🌍 Android App Icon Update Guide

## Goal
Change your Android APK icon to the **earth logo** (same as browser favicon)

---

## 📂 Current Earth Logo Location

**Your earth logo files:**
- `public/logo earth.png` - PNG version
- `public/earth-logo.svg` - Vector version

**Currently used in:**
- ✅ Browser favicon
- ✅ PWA icon
- ✅ Apple Touch icons
- ⚠️ Android APK (needs update)

---

## 🚀 Method 1: Automated Script (EASIEST)

### Run This Command:

**Double-click:** `UPDATE-ANDROID-ICON.bat`

This script will:
1. ✅ Sync earth logo from PWA manifest to Android
2. ✅ Verify icon files are in place
3. ✅ Build APK with new icon
4. ✅ Open folder with APK

**Time:** 10-15 minutes (includes build)

**Result:** APK with earth logo icon! 🌍

---

## 🛠️ Method 2: Manual Sync (Quick)

If you just want to sync without building:

### Steps:

1. Open terminal/command prompt

2. Run:
```bash
npx cap sync android
```

3. This syncs your PWA icons to Android automatically

4. Then build APK:
```bash
BUILD-COMPLETE-APK-ALL-FIXES.bat
```

**Why it works:**
- Capacitor reads `public/manifest.json`
- Finds icon path: `/logo earth.png`
- Copies to Android mipmap folders
- Generates all required sizes

---

## 🎨 Method 3: Online Icon Generator

If automatic sync doesn't work, use an online tool:

### Steps:

1. **Go to:** https://icon.kitchen/

2. **Upload:** `public/logo earth.png`

3. **Configure:**
   - Icon Type: Android Launcher Icon
   - Shape: Circle or Rounded Square
   - Background: Transparent (or #1e40af for blue)
   - Trim: Adjust to fit
   - Padding: Add some padding if needed

4. **Download** the generated icon pack

5. **Extract** the zip file

6. **Copy** the contents to your project:
   ```
   Extract to: android/app/src/main/res/
   (Replace existing mipmap folders)
   ```

7. **Rebuild APK:**
   ```bash
   BUILD-COMPLETE-APK-ALL-FIXES.bat
   ```

**Recommended Settings:**
- Foreground: Your earth logo
- Background: Solid color or transparent
- Shape: Circle (modern Android style)

---

## 🎨 Method 4: Android Studio (Professional)

If you have Android Studio installed:

### Steps:

1. **Open Android Studio**

2. **Open Project:**
   - File → Open
   - Select: `android` folder
   - Wait for sync to complete

3. **Generate Icon:**
   - Right-click: `res` folder
   - New → Image Asset

4. **Configure:**
   - Icon Type: Launcher Icons (Adaptive and Legacy)
   - Asset Type: Image
   - Path: Browse to `public/logo earth.png`
   - Name: ic_launcher
   - Trim: Yes (if needed)
   - Resize: 100% (adjust as needed)
   - Shape: Circle
   - Background Layer:
     - Asset Type: Color
     - Color: #1e40af (or transparent)

5. **Preview** the icon in different sizes

6. **Click:** Next → Finish

7. **Close Android Studio**

8. **Rebuild APK:**
   ```bash
   BUILD-COMPLETE-APK-ALL-FIXES.bat
   ```

**Advantages:**
- High-quality adaptive icons
- Preview before generating
- All sizes automatically created
- Supports Android 8.0+ adaptive icons

---

## 📱 Android Icon Sizes Required

Android needs icons in multiple resolutions:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png (192x192)
```

**Total sizes needed:** 5 different resolutions

---

## ✅ Verification Steps

After rebuilding and installing the APK:

### 1. Check App Drawer
```
Look for: QMAZ Project Map
Icon: Should show earth logo 🌍
```

### 2. Check Home Screen
- Long-press app
- Drag to home screen
- Icon should show earth logo

### 3. Check Recent Apps
- Open recent apps menu
- Find QMAZ Project Map
- Icon should show earth logo

### 4. Check Settings
- Settings → Apps
- Find QMAZ Project Map
- Icon should show earth logo

---

## 🔧 Troubleshooting

### Icon Still Shows Old Default Icon

**Solution 1: Clear Cache**
1. Uninstall app completely
2. Restart device
3. Reinstall new APK

**Why:** Android caches launcher icons

**Solution 2: Force Launcher Refresh**
1. Settings → Apps → Launcher
2. Clear cache
3. Restart device
4. Icons will refresh

**Solution 3: Verify Icon Files**
Check if icons exist:
```
android/app/src/main/res/mipmap-*/ic_launcher.png
```

If missing, run:
```bash
npx cap sync android
```

### Icon Looks Blurry

**Solution:**
- Use higher resolution source (512x512 or larger)
- Use PNG format (not JPG)
- Regenerate icons with proper sizing

### Icon Has White/Wrong Background

**Solution:**
- Use transparent PNG
- Or set background color in generator
- Regenerate all sizes

### Build Succeeds But No Icon Change

**Solution:**
1. Clean build:
```bash
cd android
gradlew clean
cd ..
```

2. Delete APK:
```
Delete: android/app/build/outputs/apk/release/app-release.apk
```

3. Rebuild:
```bash
BUILD-COMPLETE-APK-ALL-FIXES.bat
```

---

## 📋 Icon Best Practices

### Source Image Requirements

**For Best Results:**
- ✅ Resolution: 512x512 or higher
- ✅ Format: PNG with transparency
- ✅ Colors: Clear, high contrast
- ✅ Shape: Works in circle
- ✅ Padding: Some space around edges

**Your Earth Logo:**
- ✅ Perfect for app icon!
- ✅ Recognizable at small sizes
- ✅ Clear globe shape
- ✅ Works in circle
- ✅ Brand identity

### Design Tips

**DO:**
- ✓ Keep it simple
- ✓ High contrast
- ✓ Recognizable when small
- ✓ Consistent with brand

**DON'T:**
- ✗ Too much detail
- ✗ Text in icon (too small)
- ✗ Low contrast
- ✗ Complex gradients

---

## 🎯 Quick Commands Reference

**Automatic (Recommended):**
```bash
UPDATE-ANDROID-ICON.bat
```

**Manual Sync:**
```bash
npx cap sync android
```

**Build APK:**
```bash
BUILD-COMPLETE-APK-ALL-FIXES.bat
```

**Clean Build (if issues):**
```bash
cd android
gradlew clean
cd ..
BUILD-COMPLETE-APK-ALL-FIXES.bat
```

---

## 📱 Expected Result

### Before (Default Capacitor Icon):
```
┌──────┐
│  ⚡  │  QMAZ Project Map
└──────┘
```

### After (Earth Logo):
```
┌──────┐
│  🌍  │  QMAZ Project Map
└──────┘
```

**The earth logo will replace the default icon!**

---

## 🎉 Success Criteria

After installation, you should see:

✅ **App Drawer:** Earth logo icon  
✅ **Home Screen:** Earth logo when added  
✅ **Recent Apps:** Earth logo in card  
✅ **Settings:** Earth logo in app list  
✅ **Notifications:** Earth logo (if any)  

**All instances should show the earth logo!**

---

## 📝 Summary

**Easiest Method:**
1. Run: `UPDATE-ANDROID-ICON.bat`
2. Wait 10-15 minutes
3. Install APK
4. Earth logo appears! 🌍

**If that doesn't work:**
1. Use icon.kitchen to generate icons
2. Copy to android/app/src/main/res/
3. Rebuild APK

**Your earth logo:**
- Currently: Browser favicon ✓
- Soon: Android app icon ✓
- Consistent branding across platforms! ✓

---

## ⚡ Quick Start

**Just run this:**
```batch
UPDATE-ANDROID-ICON.bat
```

**Then install the APK and enjoy your earth logo icon!** 🌍🚀

