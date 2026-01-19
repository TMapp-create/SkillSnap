import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, PartyPopper, Trash2 } from 'lucide-react';
import { Goal, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GoalSetterProps {
  userId: string;
}

export function GoalSetter({ userId }: GoalSetterProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    target_hours: '',
    period: 'semester' as 'semester' | 'year' | 'custom',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesData) setCategories(categoriesData);

    const { data: goalsData } = await supabase
      .from('goals')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (goalsData) {
      const goalsWithProgress = await Promise.all(
        goalsData.map(async (goal) => {
          const { data: activities } = await supabase
            .from('activities')
            .select('duration_hours, xp_earned')
            .eq('user_id', userId)
            .eq('category_id', goal.category_id)
            .eq('status', 'approved')
            .gte('date', goal.start_date)
            .lte('date', goal.end_date);

          const currentHours =
            activities?.reduce((sum, a) => sum + Number(a.duration_hours), 0) || 0;
          const currentXP =
            activities?.reduce((sum, a) => sum + Number(a.xp_earned), 0) || 0;

          const progressPercentage = Math.min(
            (currentHours / Number(goal.target_hours)) * 100,
            100
          );

          if (progressPercentage >= 100 && !goal.is_completed) {
            await supabase
              .from('goals')
              .update({ is_completed: true, completed_at: new Date().toISOString() })
              .eq('id', goal.id);

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }

          return {
            ...goal,
            current_hours: currentHours,
            current_xp: currentXP,
            progress_percentage: progressPercentage,
          };
        })
      );

      setGoals(goalsWithProgress);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const category = categories.find((c) => c.id === formData.category_id);
    if (!category) return;

    const targetXP = Math.round(
      50 * Number(formData.target_hours) * category.xp_multiplier
    );

    let endDate = formData.end_date;
    if (formData.period === 'semester') {
      const start = new Date(formData.start_date);
      start.setMonth(start.getMonth() + 4);
      endDate = start.toISOString().split('T')[0];
    } else if (formData.period === 'year') {
      const start = new Date(formData.start_date);
      start.setFullYear(start.getFullYear() + 1);
      endDate = start.toISOString().split('T')[0];
    }

    const { error } = await supabase.from('goals').insert({
      user_id: userId,
      category_id: formData.category_id,
      target_hours: Number(formData.target_hours),
      target_xp: targetXP,
      period: formData.period,
      start_date: formData.start_date,
      end_date: endDate,
      is_completed: false,
    });

    if (!error) {
      setFormData({
        category_id: '',
        target_hours: '',
        period: 'semester',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      setShowAddModal(false);
      loadData();
    }
  };

  const handleDelete = async (goalId: string) => {
    await supabase.from('goals').delete().eq('id', goalId);
    loadData();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="text-9xl">
            <PartyPopper className="w-32 h-32 text-yellow-500 animate-bounce" />
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h2>
        </div>

        {user?.id === userId && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </motion.button>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No goals set yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-xl border-2 ${
                goal.is_completed
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {goal.category?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Target: {goal.target_hours}h</span>
                    <span>•</span>
                    <span className="capitalize">{goal.period}</span>
                    <span>•</span>
                    <span>
                      {new Date(goal.start_date).toLocaleDateString()} -{' '}
                      {new Date(goal.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {user?.id === userId && !goal.is_completed && (
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {goal.current_hours?.toFixed(1) || 0}h / {goal.target_hours}h
                  </span>
                  <span className="font-bold" style={{ color: goal.category?.color }}>
                    {Math.round(goal.progress_percentage || 0)}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress_percentage || 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.category?.color }}
                  />
                </div>
              </div>

              {goal.is_completed && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                  <PartyPopper className="w-4 h-4" />
                  Goal Completed!
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Set New Goal
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Hours
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.target_hours}
                    onChange={(e) =>
                      setFormData({ ...formData, target_hours: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        period: e.target.value as 'semester' | 'year' | 'custom',
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="semester">Semester (4 months)</option>
                    <option value="year">Year (12 months)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {formData.period === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                >
                  Create Goal
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
