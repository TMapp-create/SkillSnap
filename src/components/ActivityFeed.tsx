import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Activity, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ActivityFeedProps {
  userId?: string;
  categoryFilter?: string;
  limit?: number;
}

export function ActivityFeed({ userId, categoryFilter, limit }: ActivityFeedProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
    loadActivities();
  }, [userId, categoryFilter]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
  };

  const loadActivities = async () => {
    setLoading(true);

    let query = supabase
      .from('activities')
      .select(`
        *,
        category:categories(*),
        profile:profiles(*),
        kudos(count)
      `)
      .eq('status', 'approved')
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter);
    }

    if (limit) {
      query = query.limit(limit);
    } else {
      query = query.limit(20);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading activities:', error);
    } else if (data) {
      const activitiesWithKudos = await Promise.all(
        data.map(async (activity) => {
          const { count } = await supabase
            .from('kudos')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activity.id);

          const { data: userKudos } = await supabase
            .from('kudos')
            .select('id')
            .eq('activity_id', activity.id)
            .eq('user_id', user?.id || '')
            .maybeSingle();

          return {
            ...activity,
            kudos_count: count || 0,
            user_has_kudoed: !!userKudos,
          };
        })
      );

      setActivities(activitiesWithKudos);
    }

    setLoading(false);
  };

  const handleKudos = async (activityId: string, currentlyKudoed: boolean) => {
    if (!user) return;

    if (currentlyKudoed) {
      await supabase
        .from('kudos')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('kudos')
        .insert({ activity_id: activityId, user_id: user.id });
    }

    loadActivities();
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Award;
    return Icon;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
        <Icons.Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {activities.map((activity, index) => {
          const Icon = getCategoryIcon(activity.category?.icon || 'Award');

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: activity.category?.color || '#3b82f6' }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{activity.category?.name}</span>
                          <span>•</span>
                          <span>{new Date(activity.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{activity.duration_hours}h</span>
                        </div>
                      </div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                      >
                        +{activity.xp_earned} XP
                      </motion.div>
                    </div>

                    {activity.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {activity.description}
                      </p>
                    )}

                    {activity.photo_url && (
                      <img
                        src={activity.photo_url}
                        alt={activity.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}

                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleKudos(activity.id, activity.user_has_kudoed || false)
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          activity.user_has_kudoed
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icons.Heart
                          className={`w-4 h-4 ${
                            activity.user_has_kudoed ? 'fill-current' : ''
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {activity.kudos_count || 0}
                        </span>
                      </motion.button>

                      {activity.proof_link && (
                        <a
                          href={activity.proof_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Icons.ExternalLink className="w-4 h-4" />
                          <span className="text-sm font-medium">Proof</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
