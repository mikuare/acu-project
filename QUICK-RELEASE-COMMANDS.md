# ⚡ Quick Release Commands - Cheat Sheet

## 📝 Files to Edit Manually

### 1. `android/app/build.gradle` (Line ~10-11)
```gradle
versionCode 2        // Increment this (was 1)
versionName "1.1.0"  // Update this (was "1.0.0")
```

### 2. `src/hooks/useUpdateCheck.ts` (Line ~6)
```typescript
const CURRENT_VERSION_CODE = 2;  // Must match build.gradle!
```

---

## 💻 Commands to Run (in order)

```bash
# 1. Build web app
npm run build

# 2. Sync with Android  
npx cap sync android

# 3. Navigate to Android folder
cd android

# 4. Build signed APK
gradlew assembleRelease

# Your APK is at: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📤 Upload to GitHub

1. **Rename APK:** `qmaz-project-map-v1.1.0.apk`
2. **Create release:** https://github.com/mikuare/qmaz-project-update/releases/new
3. **Tag:** `v1.1.0`
4. **Upload APK**
5. **Copy APK download URL**

---

## ✏️ Edit update.json

Go to: https://github.com/mikuare/qmaz-project-update

Edit `update.json`:
```json
{
  "latestVersion": "1.1.0",
  "versionCode": 2,
  "changelog": "✨ New:\n• Feature 1\n• Feature 2\n\n🐛 Fixed:\n• Bug 1\n• Bug 2",
  "apkUrl": "https://github.com/mikuare/qmaz-project-update/releases/download/v1.1.0/qmaz-project-map-v1.1.0.apk",
  "releaseDate": "2025-10-28",
  "isCritical": false
}
```

Commit changes!

---

## ✅ Done!

Users with old versions will see the update prompt! 🎉

---

## 🔢 Version Numbering

| Type | Old | New | Increment |
|------|-----|-----|-----------|
| Bug Fix | 1.0.0 | 1.0.1 | PATCH |
| New Features | 1.0.1 | 1.1.0 | MINOR |
| Major Update | 1.1.0 | 2.0.0 | MAJOR |

**versionCode:** Always +1 (1 → 2 → 3 → 4...)

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Run: `npm install` then try again |
| Java error | Check Java 17 is installed |
| APK unsigned | Check `android/gradle.properties` has keystore config |
| Update not showing | Check versionCode is higher in update.json |
| GitHub Pages not updating | Wait 1-2 minutes, clear cache |

---

**📚 Full Guide:** `RELEASE-NEW-APK-VERSION.md`

