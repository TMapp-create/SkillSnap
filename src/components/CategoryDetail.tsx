import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Category, SubSkill, Badge, LeaderboardEntry } from '../types';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface CategoryDetailProps {
  categoryId: string;
  userId: string;
}

export function CategoryDetail({ categoryId, userId }: CategoryDetailProps) {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [subSkills, setSubSkills] = useState<SubSkill[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState({ totalHours: 0, totalXP: 0, activitiesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [categoryId, userId]);

  const loadData = async () => {
    setLoading(true);

    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryData) setCategory(categoryData);

    const { data: subSkillsData } = await supabase
      .from('sub_skills')
      .select('*')
      .eq('category_id', categoryId);

    if (subSkillsData) setSubSkills(subSkillsData);

    const { data: badgesData } = await supabase
      .from('badges')
      .select('*')
      .eq('category_id', categoryId)
      .order('tier');

    if (badgesData) setBadges(badgesData);

    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (earnedBadges) {
      setEarnedBadgeIds(new Set(earnedBadges.map((b) => b.badge_id)));
    }

    const { data: activities } = await supabase
      .from('activities')
      .select('duration_hours, xp_earned')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('status', 'approved');

    if (activities) {
      const totalHours = activities.reduce((sum, a) => sum + Number(a.duration_hours), 0);
      const totalXP = activities.reduce((sum, a) => sum + Number(a.xp_earned), 0);
      setUserStats({
        totalHours,
        totalXP,
        activitiesCount: activities.length,
      });
    }

    const { data: allActivities } = await supabase
      .from('activities')
      .select(`
        user_id,
        xp_earned,
        profile:profiles(*)
      `)
      .eq('category_id', categoryId)
      .eq('status', 'approved');

    if (allActivities) {
      const userMap = new Map<string, { profile: any; totalXP: number; count: number }>();

      allActivities.forEach((activity) => {
        const existing = userMap.get(activity.user_id);
        if (existing) {
          existing.totalXP += Number(activity.xp_earned);
          existing.count += 1;
        } else {
          userMap.set(activity.user_id, {
            profile: activity.profile,
            totalXP: Number(activity.xp_earned),
            count: 1,
          });
        }
      });

      const leaderboardData: LeaderboardEntry[] = Array.from(userMap.entries())
        .map(([user_id, data]) => ({
          user_id,
          profile: data.profile,
          total_xp: data.totalXP,
          activities_count: data.count,
          rank: 0,
        }))
        .sort((a, b) => b.total_xp - a.total_xp)
        .slice(0, 10)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaderboard(leaderboardData);
    }

    setLoading(false);
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Award;
    return Icon;
  };

  const getBadgeIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Award;
    return Icon;
  };

  if (loading || !category) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(category.icon);

  return (
    <div className="space-y-6">
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        style={{ borderTop: `4px solid ${category.color}` }}
      >
        <div className="flex items-center gap-6 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: category.color }}
          >
            <CategoryIcon className="w-10 h-10 text-white" />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {category.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-3xl font-bold" style={{ color: category.color }}>
              {userStats.totalHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-3xl font-bold" style={{ color: category.color }}>
              {userStats.totalXP.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-3xl font-bold" style={{ color: category.color }}>
              {userStats.activitiesCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
          </div>
        </div>

        {subSkills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sub-Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subSkills.map((skill) => {
                const SkillIcon = getCategoryIcon(skill.icon);
                return (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                  >
                    <SkillIcon className="w-8 h-8 mb-2" style={{ color: category.color }} />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {skill.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {skill.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const BadgeIcon = getBadgeIcon(badge.icon);
              const isEarned = earnedBadgeIds.has(badge.id);

              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-lg border-2 ${
                    isEarned
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
                  }`}
                >
                  <BadgeIcon
                    className={`w-10 h-10 mb-2 ${
                      isEarned ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {badge.description}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      badge.tier === 'gold'
                        ? 'bg-yellow-500 text-white'
                        : badge.tier === 'silver'
                        ? 'bg-gray-400 text-white'
                        : 'bg-orange-600 text-white'
                    }`}
                  >
                    {badge.tier}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" style={{ color: category.color }} />
              Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    entry.user_id === userId
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{
                      backgroundColor:
                        entry.rank === 1
                          ? '#fbbf24'
                          : entry.rank === 2
                          ? '#9ca3af'
                          : entry.rank === 3
                          ? '#cd7f32'
                          : category.color,
                    }}
                  >
                    {entry.rank}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {entry.profile?.full_name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.activities_count} activities
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: category.color }}>
                      {entry.total_xp.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">XP</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
