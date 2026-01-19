import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogOut, Moon, Sun, Shield, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../components/ProfileHeader';
import { SkillsReportCard } from '../components/SkillsReportCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { LogActivityModal } from '../components/LogActivityModal';
import { GoalSetter } from '../components/GoalSetter';
import { AdminVerificationPanel } from '../components/AdminVerificationPanel';
import { supabase } from '../lib/supabase';
import { Category } from '../types';

export function Dashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogModal, setShowLogModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleActivityLogged = () => {
    refreshProfile();
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              SkillSnap
            </motion.h1>

            <div className="flex items-center gap-3">
              {profile.is_admin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className={`p-2 rounded-lg transition-colors ${
                    showAdminPanel
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAdminPanel ? (
          <AdminVerificationPanel />
        ) : (
          <>
            <ProfileHeader
              profile={profile}
              isOwnProfile={true}
              onUpdate={refreshProfile}
            />

            <SkillsReportCard userId={user.id} userName={profile.full_name} />

            <div className="mt-8">
              <GoalSetter userId={user.id} />
            </div>

            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Activity Feed
                </h2>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <ActivityFeed userId={user.id} categoryFilter={categoryFilter} />
            </div>
          </>
        )}
      </main>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowLogModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all z-40"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      <LogActivityModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSuccess={handleActivityLogged}
      />
    </div>
  );
}
