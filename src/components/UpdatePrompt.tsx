import { useState, useEffect } from "react";
import { X, Download, AlertCircle, Gift, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { UpdateInfo } from "@/hooks/useUpdateCheck";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

interface UpdatePromptProps {
  updateInfo: UpdateInfo;
}

const UpdatePrompt = ({ updateInfo }: UpdatePromptProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [countdown, setCountdown] = useState(6); // 6 seconds countdown
  const [isVisible, setIsVisible] = useState(false);

  // Show with slide-in animation after mount
  useEffect(() => {
    console.log("🎨 UpdatePrompt mounted!");
    console.log("📦 Update info:", updateInfo);
    const showTimer = setTimeout(() => {
      console.log("✨ Making notification visible now!");
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(showTimer);
  }, []);

  // Auto-dismiss countdown (only for non-critical updates)
  useEffect(() => {
    if (updateInfo.isCritical) return; // Don't auto-dismiss critical updates

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0, auto-dismiss
      if (!updateInfo.isCritical) {
        setIsVisible(false);
        setTimeout(() => {
          setIsDismissed(true);
        }, 300);
      }
    }
  }, [countdown, updateInfo.isCritical, setIsVisible, setIsDismissed]);

  if (isDismissed && !updateInfo.isCritical) {
    return null;
  }

  const handleDownload = async () => {
    try {
      console.log("📥 Opening download link:", updateInfo.apkUrl);

      if (Capacitor.isNativePlatform()) {
        // Open in external browser for download
        await Browser.open({
          url: updateInfo.apkUrl,
          presentationStyle: "popover",
        });
      } else {
        // Fallback for web (shouldn't happen, but just in case)
        window.open(updateInfo.apkUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to open download:", error);
      // Fallback: try direct window.open
      window.open(updateInfo.apkUrl, "_blank");
    }
  };

  const handleDismiss = () => {
    if (!updateInfo.isCritical) {
      setIsVisible(false);
      setTimeout(() => {
        setIsDismissed(true);
      }, 300); // Wait for slide-out animation
    }
  };

  return (
    <div 
      className={`fixed inset-0 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        paddingTop: '10vh',
        zIndex: 2147483647, // MAXIMUM z-index value in CSS
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: isVisible ? 'auto' : 'none' // Allow clicks only when visible
      }}
    >
      <div 
        className={`bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ 
          position: 'relative',
          zIndex: 2147483647, // MAXIMUM z-index
          pointerEvents: 'auto' // Always allow clicks on the card
        }}
      >
        {/* Auto-dismiss countdown - only if not critical */}
        {!updateInfo.isCritical && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
              <Clock className="w-3 h-3" />
              <span>{countdown}s</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-4 rounded-full">
            {updateInfo.isCritical ? (
              <AlertCircle className="w-12 h-12 text-yellow-300" />
            ) : (
              <Gift className="w-12 h-12 text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {updateInfo.isCritical ? "⚠️ Critical Update" : "🎉 Update Available"}
        </h2>

        {/* Version Info */}
        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <p className="text-center text-sm text-white/90 mb-1">
            New Version: <span className="font-bold text-lg">{updateInfo.latestVersion}</span>
          </p>
          <p className="text-center text-xs text-white/70">
            Released: {new Date(updateInfo.releaseDate).toLocaleDateString()}
          </p>
        </div>

        {/* Changelog */}
        {updateInfo.changelog && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2 text-white/90">
              📝 What's New:
            </h3>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-white/90 whitespace-pre-line">
                {updateInfo.changelog}
              </p>
            </div>
          </div>
        )}

        {/* Critical update notice */}
        {updateInfo.isCritical && (
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-100 text-center">
              ⚠️ This update contains critical fixes. Please update now.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-white text-blue-700 hover:bg-blue-50 font-bold text-base py-6 shadow-lg transition-all hover:scale-105"
          >
            <Download className="w-5 h-5 mr-2" />
            Install Now
          </Button>

          {!updateInfo.isCritical && (
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold py-6 transition-all hover:scale-105"
            >
              Later
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-white/70 text-center">
            💡 After downloading, open the APK file to install. You may need to allow installation from unknown sources in your device settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;

