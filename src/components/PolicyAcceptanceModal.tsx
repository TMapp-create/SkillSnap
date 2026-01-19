import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Policy } from '../types';

interface PolicyAcceptanceModalProps {
  isOpen: boolean;
  onAccept: (termsVersion: string, privacyVersion: string) => void;
  onDecline?: () => void;
}

export function PolicyAcceptanceModal({ isOpen, onAccept, onDecline }: PolicyAcceptanceModalProps) {
  const [termsPolicy, setTermsPolicy] = useState<Policy | null>(null);
  const [privacyPolicy, setPrivacyPolicy] = useState<Policy | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPolicies();
    }
  }, [isOpen]);

  const fetchPolicies = async () => {
    setLoading(true);

    const [termsResult, privacyResult] = await Promise.all([
      supabase
        .from('policies')
        .select('*')
        .eq('policy_type', 'terms_of_service')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('policies')
        .select('*')
        .eq('policy_type', 'privacy_policy')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    if (termsResult.data) setTermsPolicy(termsResult.data);
    if (privacyResult.data) setPrivacyPolicy(privacyResult.data);

    setLoading(false);
  };

  const handleAccept = () => {
    if (acceptedTerms && acceptedPrivacy && termsPolicy && privacyPolicy) {
      onAccept(termsPolicy.version, privacyPolicy.version);
    }
  };

  const canAccept = acceptedTerms && acceptedPrivacy && !loading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Accept Our Policies
                </h2>
                {onDecline && (
                  <button
                    onClick={onDecline}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                To continue using SkillSnap, please review and accept our Terms of Service and Privacy Policy.
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Terms of Service
                          </h3>
                          {termsPolicy && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Version {termsPolicy.version} • Effective {new Date(termsPolicy.effective_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Read Full Document
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <div className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto mb-4">
                        {termsPolicy ? (
                          <div className="whitespace-pre-wrap">{termsPolicy.content.substring(0, 500)}...</div>
                        ) : (
                          <p>Terms of Service not available.</p>
                        )}
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          I have read and agree to the Terms of Service
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Privacy Policy
                          </h3>
                          {privacyPolicy && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Version {privacyPolicy.version} • Effective {new Date(privacyPolicy.effective_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:underline"
                        >
                          Read Full Document
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <div className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto mb-4">
                        {privacyPolicy ? (
                          <div className="whitespace-pre-wrap">{privacyPolicy.content.substring(0, 500)}...</div>
                        ) : (
                          <p>Privacy Policy not available.</p>
                        )}
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acceptedPrivacy}
                          onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                          className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          I have read and agree to the Privacy Policy
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {onDecline && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDecline}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Decline
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: canAccept ? 1.02 : 1 }}
                  whileTap={{ scale: canAccept ? 0.98 : 1 }}
                  onClick={handleAccept}
                  disabled={!canAccept}
                  className={`w-full sm:flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    canAccept
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Accept and Continue
                </motion.button>
              </div>
              {!canAccept && !loading && (
                <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
                  Please accept both policies to continue
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
