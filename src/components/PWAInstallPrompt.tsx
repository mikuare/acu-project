import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Only show on web (not in native Capacitor app)
    if (Capacitor.isNativePlatform()) {
      return;
    }

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed as PWA
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowPrompt(false);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For browsers that don't fire beforeinstallprompt (like iOS Safari)
    // Show a generic install message
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari && !isStandalone) {
      // Show iOS-specific install prompt
      setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 5000);
      }, 1000);
    } else if (!deferredPrompt) {
      // For other browsers, show a generic message after a short delay
      setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 5000);
      }, 1000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no install prompt available, show instructions
      alert('To install:\n\nChrome/Edge: Look for the install icon in the address bar\n\niOS Safari: Tap Share → Add to Home Screen\n\nFirefox: Tap Menu → Install');
      setShowPrompt(false);
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA install prompt: ${outcome}`);
    
    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  // Check if iOS for special message
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-2xl p-4 max-w-md mx-4 relative">
        {/* Close button - More visible with background */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-all hover:scale-110 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-lg mb-1 whitespace-nowrap">
              📱 Install QMAZ Project Map
            </h3>
            <p className="text-sm text-white/90 mb-3">
              {isIOS 
                ? "Add to your home screen for a better experience!"
                : "Install this app for quick access!"}
            </p>

            {/* Install button */}
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              {isIOS ? "How to Install" : "Install Now"}
            </Button>
          </div>
        </div>

        {/* iOS specific instructions */}
        {isIOS && (
          <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/80">
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

