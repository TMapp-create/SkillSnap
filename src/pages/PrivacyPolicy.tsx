import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Policy } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function PrivacyPolicy() {
  const { user, profile } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('policy_type', 'privacy_policy')
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

    fetchPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccepted = profile?.accepted_privacy_version === policy?.version;

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
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Privacy Policy
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
                    {user && hasAccepted && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Accepted</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="prose prose-green dark:prose-invert max-w-none">
              {policy ? (
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {policy.content}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Privacy Policy not available at this time.
                </p>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Your Data Rights
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You have the right to access, correct, or delete your personal information.
                  </p>
                  <a
                    href="mailto:privacy@skillsnap.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Request Your Data
                  </a>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Cookie Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Manage your cookie preferences and control what data we collect.
                  </p>
                  <Link
                    to="/cookies"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Manage Cookies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
