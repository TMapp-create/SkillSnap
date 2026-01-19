import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, Calendar, CheckCircle, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Policy, CookiePreferences } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function CookiePolicy() {
  const { user } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('policy_type', 'cookie_policy')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching policy:', error);
      } else {
        setPolicy(data);
      }
      setLoading(false);
    };

    const loadPreferences = () => {
      const stored = localStorage.getItem('cookie_preferences');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse cookie preferences');
        }
      }
    };

    fetchPolicy();
    loadPreferences();

    if (user) {
      loadUserConsent();
    }
  }, [user]);

  const loadUserConsent = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_consents')
      .select('cookie_preferences')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data && data.cookie_preferences) {
      setPreferences(data.cookie_preferences as CookiePreferences);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences));

    if (user) {
      const { error } = await supabase
        .from('user_consents')
        .upsert({
          user_id: user.id,
          cookie_preferences: preferences,
          cookie_version: policy?.version,
          cookie_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving preferences:', error);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <Cookie className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Cookie Policy
                </h1>
                {policy && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Effective: {new Date(policy.effective_date).toLocaleDateString()}</span>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      Version {policy.version}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Manage Cookie Preferences
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Essential Cookies
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Required for the website to function properly. These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm font-semibold">
                      Always Active
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Analytics Cookies
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help us understand how you use our site so we can improve your experience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        preferences.analytics ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          preferences.analytics ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Marketing Cookies
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Used to show you relevant content and measure campaign effectiveness.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        preferences.marketing ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          preferences.marketing ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </motion.button>
                {saved && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Preferences saved!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="prose prose-orange dark:prose-invert max-w-none">
              {policy ? (
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {policy.content}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Cookie Policy not available at this time.
                </p>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Questions about Cookies?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you have any questions about our use of cookies, please contact us.
                </p>
                <a
                  href="mailto:privacy@skillsnap.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
