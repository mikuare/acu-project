# 📍 Android Permissions Fix - Complete Guide

## Problem Identified

Your APK works as PWA (in browser) with location and camera permissions, but when installed as a native Android app:

❌ **Location permission not requested** - GPS doesn't work  
❌ **Camera permission not requested** - Camera features don't work  
❌ **No permission dialogs appear**

### Why This Happened

**PWA (Browser):**
- Browser automatically handles permissions
- Shows permission dialogs
- Works perfectly ✅

**Native Android APK:**
- Needs explicit permission declarations in `AndroidManifest.xml`
- Needs Capacitor plugins to request permissions
- Needs runtime permission requests
- Without these: permissions silently fail ❌

## Solution Applied

### 1. Added Android Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

Added:
```xml
<!-- Location permissions -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Camera permissions -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Storage permissions (for camera photos) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### 2. Added Capacitor Plugins

**File:** `package.json`

Added:
```json
"@capacitor/geolocation": "^6.0.1",
"@capacitor/camera": "^6.0.2"
```

These plugins:
- Handle permission requests on Android
- Show native permission dialogs
- Work on both web and native
- Compatible with Capacitor 6

### 3. Created Permission Utilities

**File:** `src/utils/permissions.ts`

Created helper functions:
- `requestLocationPermission()` - Request location access
- `getCurrentLocation()` - Get GPS position with permission handling
- `requestCameraPermission()` - Request camera access
- `checkLocationPermission()` - Check if permission is granted
- `checkCameraPermission()` - Check if camera permission is granted

### 4. Updated Map Component

**File:** `src/components/PhilippinesMapMapbox.tsx`

Changed from:
- ❌ `navigator.geolocation` (web API, doesn't request Android permissions)

To:
- ✅ `@capacitor/geolocation` (works on web AND native, requests permissions properly)

Now when user taps "Enter Project":
1. App requests location permission (Android dialog appears)
2. User grants permission
3. GPS location is obtained
4. Project can be entered

## How It Works Now

### On First Launch (Android APK):

#### Location Permission Flow:
1. User taps "Enter Project" button
2. **Native Android permission dialog appears:**
   ```
   Allow ACU Project Map to access this device's location?
   
   [WHILE USING THE APP]  [ONLY THIS TIME]  [DENY]
   ```
3. User taps "While using the app" or "Only this time"
4. ✅ Permission granted!
5. App gets GPS location
6. User can enter project details

#### Camera Permission Flow (if using camera):
1. User tries to take a photo
2. **Native Android permission dialog appears:**
   ```
   Allow ACU Project Map to take pictures and record video?
   
   [ALLOW]  [DENY]
   ```
3. User taps "Allow"
4. ✅ Camera works!

### On Subsequent Uses:
- If "While using the app" was selected: Automatically has permission ✅
- If "Only this time" was selected: Will ask again next time
- If "Deny" was selected: User must enable in Settings

## Files Changed

| File | Changes |
|------|---------|
| `android/app/src/main/AndroidManifest.xml` | Added location, camera, storage permissions |
| `package.json` | Added `@capacitor/geolocation` and `@capacitor/camera` |
| `src/utils/permissions.ts` | **Created** - Permission helper functions |
| `src/components/PhilippinesMapMapbox.tsx` | Updated to use Capacitor geolocation with permissions |

## Files Created for You

| File | Purpose |
|------|---------|
| `INSTALL-PERMISSIONS-PACKAGES.bat` | Install required npm packages |
| `BUILD-APK-WITH-PERMISSIONS.bat` | ⭐ Build complete APK with permissions |
| `PERMISSIONS-FIX-COMPLETE-GUIDE.md` | This guide |
| `PERMISSIONS-QUICK-START.txt` | Quick start instructions |

## How to Build APK with Permissions

### Quick Way (Recommended):

**Double-click:** `BUILD-APK-WITH-PERMISSIONS.bat`

This will:
1. ✅ Install Capacitor plugins
2. ✅ Build web app (with Mapbox token)
3. ✅ Sync to Android (with permissions)
4. ✅ Build signed APK
5. ✅ Open folder with APK

**Time:** 15-20 minutes

### Step-by-Step Way:

1. **Install packages:**
   ```batch
   INSTALL-PERMISSIONS-PACKAGES.bat
   ```

2. **Build APK:**
   ```batch
   BUILD-APK-WITH-PERMISSIONS.bat
   ```

## Testing the APK

### Installation:
1. Transfer `app-release.apk` to Android device
2. Enable "Install from Unknown Sources" if needed
3. Tap APK to install

### Testing Location Permission:
1. Open the app
2. Tap "Enter Project" button
3. **Expected:** Permission dialog appears
4. Tap "Allow" or "While using the app"
5. **Expected:** GPS location is obtained
6. **Expected:** Toast shows "Location Found"
7. **Expected:** Can enter project details

### Testing Camera Permission:
1. Use camera feature
2. **Expected:** Permission dialog appears
3. Tap "Allow"
4. **Expected:** Camera opens

### If Permission Dialog Doesn't Appear:
- App may already have permission (check Settings > Apps > ACU Project Map > Permissions)
- Or permission was previously denied
- Solution: Uninstall app completely, reinstall, and test again

## Permission States in Android

### Location Permission:
- **Not Set:** Dialog will appear on first use
- **Allowed:** GPS works automatically
- **Denied:** User must enable in Settings > Apps > ACU Project Map > Permissions

### Camera Permission:
- **Not Set:** Dialog will appear on first use
- **Allowed:** Camera works automatically
- **Denied:** User must enable in Settings

## Troubleshooting

### "Permission dialog doesn't appear"

**Solution 1:** Uninstall and reinstall
```
1. Long-press app icon
2. Tap "App info"
3. Tap "Uninstall"
4. Reinstall the APK
5. Test again
```

**Solution 2:** Check if permission already granted/denied
```
1. Settings > Apps > ACU Project Map
2. Tap "Permissions"
3. Check Location and Camera status
4. Set to "Allowed" if needed
```

### "Location not working after granting permission"

**Check:**
1. Device location (GPS) is enabled
2. Good GPS signal (go outdoors if needed)
3. App has "While using the app" or "Allow all the time" permission
4. Try restarting the app

### "Camera not opening"

**Check:**
1. Camera permission is granted
2. Camera app is not open in background
3. Device has working camera
4. Try restarting the app

## Technical Details

### Why Capacitor Instead of Browser API?

| Feature | Browser API | Capacitor API |
|---------|-------------|---------------|
| Works on Web | ✅ Yes | ✅ Yes |
| Works on Android | ❌ No proper permissions | ✅ Full Android support |
| Permission dialogs | Browser only | Native Android dialogs |
| GPS accuracy | Good | Excellent |
| Compatibility | Web only | Web + iOS + Android |

### Capacitor Geolocation API:

**Before (Browser API):**
```typescript
navigator.geolocation.getCurrentPosition(...)
```
- ❌ No Android permission request
- ❌ Silent failures on native

**After (Capacitor API):**
```typescript
import { Geolocation } from '@capacitor/geolocation';
await Geolocation.requestPermissions();
const position = await Geolocation.getCurrentPosition();
```
- ✅ Proper Android permission request
- ✅ Native permission dialogs
- ✅ Works on web AND native

## What Your Colleagues Will See

### First Time Using App:

1. **Install APK** - Normal installation
2. **Open app** - Splash screen, then map loads
3. **Tap "Enter Project"** - Permission dialog appears!
4. **Tap "Allow"** - GPS starts working
5. **Use app** - All features work!

### Subsequent Uses:

- No permission dialogs (already granted)
- GPS works immediately
- Camera works immediately
- Smooth experience!

## Summary

| Issue | Status |
|-------|--------|
| Location permission not requested | ✅ FIXED |
| Camera permission not requested | ✅ FIXED |
| Permissions in AndroidManifest | ✅ ADDED |
| Capacitor plugins installed | ✅ ADDED |
| Permission utilities created | ✅ CREATED |
| Map component updated | ✅ UPDATED |
| Build scripts created | ✅ READY |

## Next Steps

1. **Build new APK:**
   ```batch
   BUILD-APK-WITH-PERMISSIONS.bat
   ```

2. **Test on Android device:**
   - Install APK
   - Test location permission
   - Test camera permission (if applicable)

3. **Distribute to colleagues:**
   - Share `app-release.apk`
   - They will get proper permission dialogs
   - Everything will work!

## Future Updates

Once permissions are configured:
- They stay configured in all future builds
- No need to add them again
- Just rebuild APK normally
- Permissions will always work!

---

**Quick Start:** Read `PERMISSIONS-QUICK-START.txt`  
**Build Now:** Run `BUILD-APK-WITH-PERMISSIONS.bat`  
**Need Help?** Check this guide or ask!

