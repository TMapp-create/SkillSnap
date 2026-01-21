import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Share2, Lock, Unlock, QrCode, Edit } from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  onUpdate?: () => void;
}

export function ProfileHeader({ profile, isOwnProfile, onUpdate }: ProfileHeaderProps) {
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDemoMode = profile.id === 'demo-user-id';
  const profileUrl = `${window.location.origin}/profile/${profile.id}`;

  const handlePrivacyToggle = async () => {
    if (isDemoMode) return;

    const newValue = !isPublic;
    const { error } = await supabase
      .from('profiles')
      .update({ is_public: newValue })
      .eq('id', profile.id);

    if (!error) {
      setIsPublic(newValue);
      onUpdate?.();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const levelTitle = getLevelTitle(profile.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-blue-500 dark:ring-blue-400"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-blue-500 dark:ring-blue-400">
              <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 text-white text-xs font-bold shadow-lg">
            Lv {profile.level}
          </div>
        </motion.div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile.full_name}
            </h1>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block">
              {levelTitle}
            </span>
          </div>

          {profile.school && (
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {profile.school}
              {profile.graduation_year && ` • Class of ${profile.graduation_year}`}
            </p>
          )}

          {profile.bio && (
            <p className="text-gray-700 dark:text-gray-300 mt-2 max-w-2xl">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold">{profile.total_xp.toLocaleString()}</div>
              <div className="text-xs opacity-90">Total XP</div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold">{profile.streak}</div>
              <div className="text-xs opacity-90">Day Streak</div>
            </div>
          </div>
        </div>

        {isOwnProfile && !isDemoMode && (
          <div className="flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrivacyToggle}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isPublic ? 'Public' : 'Private'}
              </span>
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </motion.button>

              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-10"
                >
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">
                      {copied ? 'Copied!' : 'Copy Link'}
                    </span>
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-sm">QR Code</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getLevelTitle(level: number): string {
  if (level >= 50) return 'Legend';
  if (level >= 40) return 'Elite';
  if (level >= 30) return 'Expert';
  if (level >= 20) return 'Advanced';
  if (level >= 10) return 'Trailblazer';
  if (level >= 5) return 'Rising Star';
  return 'Newcomer';
}
