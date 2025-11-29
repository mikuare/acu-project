import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// DIAGNOSTIC VERSION - Shows visible alerts
// Replace useUpdateCheck.ts with this temporarily to debug

const CURRENT_VERSION_CODE = 2;
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
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // DIAGNOSTIC: Show alert for platform detection
    if (!Capacitor.isNativePlatform()) {
      alert("⚠️ DEBUG: Not native platform - update check skipped\n\nYou're on Web/PWA, not APK!");
      console.log("🌐 Web/PWA detected - update check skipped");
      return;
    }

    alert("✅ DEBUG: Native platform detected!\n\nUpdate check will run in 5 seconds...");

    async function checkUpdate() {
      setIsChecking(true);
      try {
        alert(`🔍 DEBUG: Checking for updates...\n\nCurrent version: ${CURRENT_VERSION_CODE}\nFetching: ${UPDATE_JSON_URL}`);
        
        console.log("🔍 Checking for updates...");
        console.log(`📱 Current version code: ${CURRENT_VERSION_CODE}`);

        const res = await fetch(UPDATE_JSON_URL, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!res.ok) {
          alert(`❌ DEBUG: HTTP Error!\n\nStatus: ${res.status}\nMessage: ${res.statusText}`);
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data: UpdateInfo = await res.json();

        alert(`📦 DEBUG: Got response!\n\nLatest version: ${data.latestVersion}\nVersion code: ${data.versionCode}\nCurrent code: ${CURRENT_VERSION_CODE}\n\nShould update? ${data.versionCode > CURRENT_VERSION_CODE ? 'YES!' : 'NO'}`);

        console.log("📦 Latest version info:", data);

        if (data.versionCode > CURRENT_VERSION_CODE) {
          console.log("🎉 New update available!");
          console.log(`   Current: v${CURRENT_VERSION_CODE}`);
          console.log(`   Latest: v${data.versionCode} (${data.latestVersion})`);
          alert(`🎉 DEBUG: Update available!\n\nCurrent: ${CURRENT_VERSION_CODE}\nLatest: ${data.versionCode}\n\nUpdate prompt should appear now!`);
          setUpdateInfo(data);
        } else {
          console.log("✅ App is up to date");
          alert(`✅ DEBUG: App is up to date!\n\nCurrent: ${CURRENT_VERSION_CODE}\nLatest: ${data.versionCode}\n\nNo update needed.`);
        }
      } catch (err: any) {
        console.error("❌ Update check failed:", err);
        alert(`❌ DEBUG: Update check FAILED!\n\nError: ${err.message}\n\nCheck internet connection.`);
      } finally {
        setIsChecking(false);
      }
    }

    // Wait 5 seconds after app starts
    const timer = setTimeout(() => {
      checkUpdate();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return { updateInfo, isChecking };
}

