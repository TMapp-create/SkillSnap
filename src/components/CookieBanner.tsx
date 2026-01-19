import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CookiePreferences } from '../types';

export function CookieBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const checkCookieConsent = () => {
      const hasConsented = localStorage.getItem('cookie_consent');
      if (!hasConsented) {
        setShowBanner(true);
      }
    };

    checkCookieConsent();
  }, []);

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };

    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_preferences', JSON.stringify(allAccepted));

    if (user) {
      await saveToDatabase(allAccepted);
    }

    setShowBanner(false);
  };

  const handleRejectAll = async () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };

    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_preferences', JSON.stringify(essentialOnly));

    if (user) {
      await saveToDatabase(essentialOnly);
    }

    setShowBanner(false);
  };

  const handleSaveCustom = async () => {
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences));

    if (user) {
      await saveToDatabase(preferences);
    }

    setShowBanner(false);
  };

  const saveToDatabase = async (prefs: CookiePreferences) => {
    if (!user) return;

    await supabase
      .from('user_consents')
      .upsert({
        user_id: user.id,
        cookie_preferences: prefs,
        cookie_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              {!showSettings ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
                      <Cookie className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        We use cookies
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We use cookies to enhance your experience, analyze site usage, and personalize content.{' '}
                        <Link
                          to="/cookies"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Learn more
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSettings(true)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRejectAll}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Reject All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAcceptAll}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Accept All
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Cookie Preferences
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          Essential Cookies
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Required for the website to function
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                        Always Active
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          Analytics Cookies
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Help us improve your experience
                        </p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.analytics ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          Marketing Cookies
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Show you relevant content
                        </p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.marketing ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveCustom}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Save Preferences
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
