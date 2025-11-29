import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Request location permission from the user
 * Works in both web (browser prompt) and native (Android permissions)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    // Check if running on native platform
    if (Capacitor.isNativePlatform()) {
      // Request permission
      const permission = await Geolocation.requestPermissions();
      
      if (permission.location === 'granted' || permission.coarseLocation === 'granted') {
        console.log('✅ Location permission granted');
        return true;
      } else {
        console.log('❌ Location permission denied');
        return false;
      }
    } else {
      // On web, just try to get position (browser will prompt)
      try {
        await Geolocation.getCurrentPosition();
        return true;
      } catch (error) {
        console.error('❌ Location permission denied on web:', error);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Error requesting location permission:', error);
    return false;
  }
};

/**
 * Get current location with permission handling
 */
export const getCurrentLocation = async () => {
  try {
    // First check/request permission
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    // Get current position
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch (error: any) {
    console.error('❌ Error getting location:', error);
    throw error;
  }
};

/**
 * Request camera permission from the user
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    // Check if running on native platform
    if (Capacitor.isNativePlatform()) {
      const permission = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      
      if (permission.camera === 'granted' || permission.photos === 'granted') {
        console.log('✅ Camera permission granted');
        return true;
      } else {
        console.log('❌ Camera permission denied');
        return false;
      }
    } else {
      // On web, camera access is handled by browser when taking photo
      return true;
    }
  } catch (error) {
    console.error('❌ Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Check if location permission is granted
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted' || permission.coarseLocation === 'granted';
    } else {
      // On web, we can't check without triggering prompt, so return true
      return true;
    }
  } catch (error) {
    console.error('❌ Error checking location permission:', error);
    return false;
  }
};

/**
 * Check if camera permission is granted
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const permission = await Camera.checkPermissions();
      return permission.camera === 'granted' || permission.photos === 'granted';
    } else {
      return true;
    }
  } catch (error) {
    console.error('❌ Error checking camera permission:', error);
    return false;
  }
};

/**
 * Open app settings (for user to manually enable permissions)
 */
export const openAppSettings = () => {
  if (Capacitor.isNativePlatform()) {
    // Note: This requires additional plugin, for now just inform user
    alert('Please enable permissions in your device Settings > Apps > ACU Project Map > Permissions');
  }
};

