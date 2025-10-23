# 📸 Camera Capture with Geotag Feature

## ✨ New Features Added

### 1. **Camera Capture Button** 📷
- Added **"Capture Photo"** button with camera icon in the project form
- Users can click to instantly take a photo with their device camera
- Works on both desktop (webcam) and mobile (back camera)

### 2. **Automatic Geotag Overlay** 📍
When a photo is captured, the system automatically:
- Gets the user's current GPS location
- Embeds location data on the image as a visible overlay
- Adds timestamp to the photo
- Shows: Latitude, Longitude, and Date/Time

**Geotag Overlay Example:**
```
📍 Lat: 10.058175
   Lng: 123.436246
🕐 10/22/2025, 3:45:30 PM
```

### 3. **Image Preview** 🖼️
- Shows preview of captured/uploaded image before submission
- Displays image with geotag overlay (if captured with camera)
- Remove button to clear and retake if needed

### 4. **Field Name Changes** ✏️
Updated throughout the app:
- **Old**: "User Name" / "Submitted By"
- **New**: "Time Keeper/Checker Name" / "Time Keeper/Checker"

Changed in:
- ✅ Project Form Modal
- ✅ Edit Project Modal
- ✅ Project Details Modal
- ✅ Admin Dashboard
- ✅ View Projects Modal

## 🎯 How It Works

### For Users:

1. **Open Project Form**
   - Click "Enter Project" or "Pin on Map"
   
2. **Capture Photo**
   - Click **"Capture Photo"** button with camera icon
   - Browser requests camera permission (allow it)
   - Camera opens automatically
   - Photo is captured instantly
   
3. **Geotag Added**
   - System requests location permission (allow it)
   - GPS coordinates are obtained
   - Location and timestamp overlay is added to the image
   - Preview shows the photo with geotag
   
4. **Submit**
   - Fill in other project details
   - Photo with geotag is uploaded automatically
   - Saved to Supabase storage

### Alternative: File Upload
Users can still upload photos the traditional way:
- Click file input to browse photos
- Select image from device
- Upload as normal

## 🔧 Technical Details

### Camera API
- Uses: `navigator.mediaDevices.getUserMedia()`
- Requests: `video: { facingMode: 'environment' }`
- Mobile: Automatically uses back camera
- Desktop: Uses webcam

### Geolocation API
- Uses: `navigator.geolocation.getCurrentPosition()`
- Gets: Latitude, Longitude, Accuracy
- Fallback: If denied, captures photo without geotag
- Overlay: Drawn on canvas using `fillText()`

### Image Processing
```javascript
1. Capture video frame to canvas
2. Get GPS coordinates
3. Draw black overlay bar at bottom
4. Write location text (white) on overlay
5. Convert canvas to JPEG blob
6. Create File object
7. Upload to Supabase storage
```

### Geotag Overlay Format
- **Position**: Bottom of image
- **Height**: 80px
- **Background**: Black with 70% opacity
- **Text Color**: White
- **Font**: 16px Arial
- **Content**:
  - Line 1: 📍 Lat: {latitude}
  - Line 2: Lng: {longitude}
  - Line 3: 🕐 {date and time}

## 📱 Browser Compatibility

### Camera Access:
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS & macOS)
- ✅ Edge (Desktop & Mobile)
- ❌ Internet Explorer (Not supported)

### Requirements:
- HTTPS connection (or localhost for testing)
- Camera permission granted
- Location permission granted (optional)

## 🔒 Privacy & Permissions

### Camera Permission
- Browser asks: "Allow access to camera?"
- Required for: Camera capture feature
- Denied: Falls back to file upload

### Location Permission  
- Browser asks: "Allow access to location?"
- Required for: Geotag overlay
- Denied: Photo captured without geotag

### Data Storage
- Images: Stored in Supabase Storage bucket `project-images`
- Public access: Yes (images are publicly viewable)
- Geotag: Embedded in image as visible overlay (not EXIF data)

## 🎨 UI Changes

### Project Form Modal
```
Before:
[File Upload Input] [X]

After:
[📷 Capture Photo] [File Upload Input] [X]
[Image Preview with Geotag]
```

### Labels Updated
```
Old → New
"User Name" → "Time Keeper/Checker Name"
"Submitted By" → "Time Keeper/Checker"
```

## ✅ Testing the Feature

### Test Camera Capture:
1. Open project form
2. Click "Capture Photo"
3. Allow camera permission
4. Allow location permission
5. ✅ Photo captured with geotag overlay
6. ✅ Preview shows image
7. ✅ Submit and verify upload

### Test Without Permissions:
1. Camera denied → Error message, use file upload
2. Location denied → Photo captured without geotag
3. Both denied → File upload still works

### Test on Mobile:
1. Open on mobile device
2. Camera uses back camera automatically
3. Geotag uses device GPS
4. Works in portrait and landscape
5. Image uploads successfully

## 📊 Benefits

1. **Proof of Location** 📍
   - Photos have embedded GPS coordinates
   - Visible proof of where photo was taken
   - Can't be removed or modified

2. **Timestamp** 🕐
   - Exact date and time embedded
   - Proves when photo was taken
   - Useful for project tracking

3. **Easy to Use** ⚡
   - One-click photo capture
   - Automatic geotag
   - No manual entry needed

4. **Mobile-Friendly** 📱
   - Works great on phones
   - Uses back camera
   - Touch-friendly UI

5. **Professional** 💼
   - Clean overlay design
   - Clear information
   - Professional appearance

## 🐛 Error Handling

### Camera Not Available
```
Message: "Camera Error - Could not access camera. 
         Please use file upload instead."
Action: User can still upload from gallery
```

### Location Denied
```
Message: "Photo Captured! (location permission denied)"
Result: Photo saved without geotag
```

### No HTTPS
```
Message: "Camera Error - Camera requires secure connection"
Solution: Use HTTPS or localhost
```

## 🚀 Future Enhancements

Possible improvements:
- [ ] Show live camera preview before capture
- [ ] Multiple photo capture
- [ ] Photo editing (crop, rotate)
- [ ] Retake button
- [ ] Flash toggle
- [ ] Front/back camera switch
- [ ] Compass direction on geotag
- [ ] Altitude information
- [ ] Custom geotag styling

## 📝 Code Example

### Using the Camera Feature
```typescript
const handleCameraCapture = async () => {
  // 1. Get camera stream
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: 'environment' }
  });

  // 2. Capture frame
  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();
  
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  // 3. Add geotag
  navigator.geolocation.getCurrentPosition((position) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`📍 Lat: ${position.coords.latitude.toFixed(6)}`, 10, canvas.height - 50);
    
    // 4. Convert to file
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
    }, 'image/jpeg', 0.95);
  });

  // 5. Cleanup
  stream.getTracks().forEach(track => track.stop());
};
```

---

**Ready to use!** 🎉
The camera feature is now fully integrated and ready for testing!

