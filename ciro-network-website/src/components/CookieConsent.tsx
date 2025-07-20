"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Info, SlidersHorizontal } from "lucide-react";

const COOKIE_CATEGORIES = [
  {
    key: "essential",
    label: "Essential Cookies",
    description:
      "Required for basic site functionality (always enabled).",
    alwaysOn: true,
  },
  {
    key: "analytics",
    label: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website (e.g., page views, time on site).",
  },
  {
    key: "marketing",
    label: "Marketing Cookies",
    description:
      "Used to track the effectiveness of our marketing campaigns and personalize offers.",
  },
  {
    key: "preferences",
    label: "Preference Cookies",
    description:
      "Remember your choices, such as language and theme settings.",
  },
];

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  [key: string]: boolean;
};

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true, // Enable analytics by default for testing
  marketing: false,
  preferences: false,
};

function getStoredPreferences(): CookiePreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  const stored = localStorage.getItem("cookie-preferences");
  if (!stored) return DEFAULT_PREFERENCES;
  try {
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(prefs: CookiePreferences) {
  localStorage.setItem("cookie-preferences", JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent("cookie-preferences-changed", { detail: prefs }));
}

declare global {
  interface Window {
    enableAnalytics?: boolean;
    enableMarketing?: boolean;
    enablePreferences?: boolean;
    openCookiePreferences?: () => void;
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const stored = getStoredPreferences();
    setPreferences(stored);
    if (!localStorage.getItem("cookie-preferences")) {
      setShowBanner(true);
    } else {
      setHasConsented(true);
      setShowBanner(false);
    }
  }, []);

  // Update global flags for analytics/marketing
  useEffect(() => {
    window.enableAnalytics = preferences.analytics;
    window.enableMarketing = preferences.marketing;
    window.enablePreferences = preferences.preferences;
  }, [preferences]);

  const handleAcceptAll = () => {
    const all = { ...DEFAULT_PREFERENCES, analytics: true, marketing: true, preferences: true };
    setPreferences(all);
    savePreferences(all);
    setShowBanner(false);
    setShowModal(false);
    setHasConsented(true);
  };

  const handleDeclineAll = () => {
    const declined = { ...DEFAULT_PREFERENCES };
    setPreferences(declined);
    savePreferences(declined);
    setShowBanner(false);
    setShowModal(false);
    setHasConsented(true);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowModal(false);
    setHasConsented(true);
  };

  const handleManagePreferences = () => {
    setShowModal(true);
  };

  const handleToggle = (key: string) => {
    if (key === "essential") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Allow reopening modal for demo/testing (optional)
  useEffect(() => {
    window.openCookiePreferences = () => setShowModal(true);
  }, []);

  if (!showBanner && !showModal) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-cosmic-cyan/30 p-4 z-50"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cosmic-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-cosmic-cyan" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">We value your privacy</h3>
                      <p className="text-sm text-white/80 leading-relaxed">
                        We use cookies and similar technologies to analyze site usage, personalize content, and provide you with the best experience. This includes collecting information about your device, location, and how you interact with our site.
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <a 
                          href="/privacy" 
                          className="text-sm text-cosmic-cyan hover:text-cosmic-cyan/80 transition-colors flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          Privacy Policy
                        </a>
                        <a 
                          href="/cookies" 
                          className="text-sm text-white/60 hover:text-white/80 transition-colors"
                        >
                          Cookie Policy
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={handleDeclineAll}
                    className="px-4 py-2 text-sm border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 rounded-lg transition-all duration-200 font-medium"
                  >
                    Decline All
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2 text-sm bg-gradient-to-r from-cosmic-cyan to-nebula-pink text-black font-semibold rounded-lg hover:from-cosmic-cyan/90 hover:to-nebula-pink/90 transition-all duration-200 shadow-lg hover:shadow-cosmic-cyan/20"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleManagePreferences}
                    className="px-4 py-2 text-sm border border-cosmic-cyan/40 text-cosmic-cyan hover:bg-cosmic-cyan/10 rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Manage Preferences
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-black/95 border border-cosmic-cyan/30 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
              <button
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-cosmic-cyan" />
                <h2 className="text-2xl font-bold text-white">Cookie Preferences</h2>
              </div>
              <p className="text-white/80 mb-6 text-sm">
                Select which types of cookies you allow us to use. You can change your preferences at any time.
              </p>
              <div className="space-y-4 mb-6">
                {COOKIE_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="flex items-start gap-4 p-3 rounded-lg bg-black/60 border border-cosmic-cyan/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-base">{cat.label}</span>
                        {cat.alwaysOn && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-cosmic-cyan/20 text-cosmic-cyan rounded">Always On</span>
                        )}
                      </div>
                      <p className="text-white/70 text-xs mt-1">{cat.description}</p>
                    </div>
                    <div className="flex items-center h-full">
                      {cat.alwaysOn ? (
                        <input type="checkbox" checked disabled className="accent-cosmic-cyan w-5 h-5" />
                      ) : (
                        <input
                          type="checkbox"
                          checked={preferences[cat.key]}
                          onChange={() => handleToggle(cat.key)}
                          className="accent-cosmic-cyan w-5 h-5"
                          aria-label={`Toggle ${cat.label}`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleDeclineAll}
                  className="px-4 py-2 text-sm border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 rounded-lg transition-all duration-200 font-medium"
                >
                  Decline All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-cosmic-cyan to-nebula-pink text-black font-semibold rounded-lg hover:from-cosmic-cyan/90 hover:to-nebula-pink/90 transition-all duration-200 shadow-lg hover:shadow-cosmic-cyan/20"
                >
                  Accept All
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm border border-cosmic-cyan/40 text-cosmic-cyan hover:bg-cosmic-cyan/10 rounded-lg transition-all duration-200 font-medium"
                >
                  Save Preferences
                </button>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <a
                  href="/privacy"
                  className="text-sm text-cosmic-cyan hover:text-cosmic-cyan/80 transition-colors flex items-center gap-1"
                >
                  <Info className="w-3 h-3" /> Privacy Policy
                </a>
                <a
                  href="/cookies"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 