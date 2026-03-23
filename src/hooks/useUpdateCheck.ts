import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// IMPORTANT: Update this every time you build a new APK!
// This should match android/app/build.gradle -> versionCode
const CURRENT_VERSION_CODE = 1;

// GitHub Pages URL for update metadata
const UPDATE_JSON_URL = "https://mikuare.github.io/qmaz-project-update/update.json";

export interface UpdateInfo {
  latestVersion: string;
  versionCode: number;
  changelog: string;
  apkUrl: string;
  releaseDate: string;
  isCritical: boolean;
}

export function useUpdateCheck() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    // ONLY check for updates on native Android APK
    // DO NOT check on web or PWA
    const platform = Capacitor.getPlatform();
    
    if (platform !== "android" && platform !== "ios") {
      return;
    }

    async function checkUpdate() {
      try {
        const res = await fetch(UPDATE_JSON_URL, { cache: "no-store" });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data: UpdateInfo = await res.json();
        
        if (data.versionCode > CURRENT_VERSION_CODE) {
          setUpdateInfo(data);
        }
      } catch (err) {
        console.error("❌ Update check failed:", err);
      }
    }

    // Check after small delay (so splash/login isn't blocked)
    const timer = setTimeout(() => {
      checkUpdate();
    }, 3000); // wait 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return { updateInfo };
}

