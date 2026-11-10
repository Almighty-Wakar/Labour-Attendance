import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'button' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidManualGuide, setShowAndroidManualGuide] = useState(false);

  // If already running as an installed PWA on device home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowAndroidManualGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors whitespace-nowrap shrink-0 shadow-2xs ${className}`}
          title="Install Labour Attendance on phone or computer"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-500" />
          <span>Install App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors shadow-sm ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Install App on Device</span>
        </button>
      )}

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Install on iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                  1
                </div>
                <div className="flex-1">
                  Tap the <strong className="text-neutral-900 dark:text-white inline-flex items-center gap-1">Share <Share2 className="w-3.5 h-3.5 inline" /></strong> button in Safari's bottom toolbar.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                  2
                </div>
                <div className="flex-1">
                  Scroll down the menu and tap <strong className="text-neutral-900 dark:text-white inline-flex items-center gap-1">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline" /></strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                  3
                </div>
                <div className="flex-1">
                  Tap <strong className="text-neutral-900 dark:text-white">Add</strong> in the top right. The Labour Attendance icon will appear on your Home Screen!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Android/Chrome Manual Installation Instructions Modal */}
      {showAndroidManualGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Install App on Device
                </h3>
              </div>
              <button
                onClick={() => setShowAndroidManualGuide(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              <p>
                To install <strong>Labour Attendance</strong> as an offline app:
              </p>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg space-y-2">
                <div>
                  <strong>On Android / Chrome:</strong> Tap the 3 dots menu in the browser top-right, then select <em>"Add to Home screen"</em> or <em>"Install App"</em>.
                </div>
                <div>
                  <strong>On Desktop (Chrome/Edge):</strong> Look for the install icon in the URL address bar or click the 3 dots menu &gt; <em>"Install Labour Attendance"</em>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidManualGuide(false)}
              className="mt-5 w-full rounded-lg bg-amber-400 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
