import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogActivityModal({ isOpen, onClose, onSuccess }: LogActivityModalProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration_hours: '',
    description: '',
    photo_url: '',
    proof_link: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
  };

  const calculateXP = (categoryId: string, hours: number): number => {
    const category = categories.find((c) => c.id === categoryId);
    const baseXP = 50;
    const multiplier = category?.xp_multiplier || 1;
    return Math.round(baseXP * hours * multiplier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const xpEarned = calculateXP(
      formData.category_id,
      parseFloat(formData.duration_hours)
    );

    const { error } = await supabase.from('activities').insert({
      user_id: user.id,
      category_id: formData.category_id,
      title: formData.title,
      date: formData.date,
      duration_hours: parseFloat(formData.duration_hours),
      description: formData.description || null,
      photo_url: formData.photo_url || null,
      proof_link: formData.proof_link || null,
      xp_earned: xpEarned,
      status: 'approved',
    });

    if (!error) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, level')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newTotalXP = profile.total_xp + xpEarned;
        const newLevel = Math.floor(newTotalXP / 1000) + 1;

        await supabase
          .from('profiles')
          .update({
            total_xp: newTotalXP,
            level: newLevel,
          })
          .eq('id', user.id);
      }

      setFormData({
        category_id: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        duration_hours: '',
        description: '',
        photo_url: '',
        proof_link: '',
      });

      onSuccess();
      onClose();
    }

    setLoading(false);
  };

  const estimatedXP =
    formData.category_id && formData.duration_hours
      ? calculateXP(formData.category_id, parseFloat(formData.duration_hours))
      : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-[#0F52BA] dark:bg-[#1E3A8A] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">
                Log Activity
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/30 text-white backdrop-blur-sm"
                  >
                    <option value="" className="text-gray-900">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="text-gray-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Title
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Guitar Practice Session"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 backdrop-blur-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Date
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/30 text-white backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Duration (hours)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formData.duration_hours}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_hours: e.target.value })
                      }
                      placeholder="2.5"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Tell us about your activity..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 backdrop-blur-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Photo URL
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="url"
                      value={formData.photo_url}
                      onChange={(e) =>
                        setFormData({ ...formData, photo_url: e.target.value })
                      }
                      placeholder="https://example.com/photo.jpg"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Proof Link (optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="url"
                      value={formData.proof_link}
                      onChange={(e) =>
                        setFormData({ ...formData, proof_link: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {estimatedXP > 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white text-[#0F52BA] p-4 rounded-lg flex items-center gap-3"
                  >
                    <Sparkles className="w-6 h-6" />
                    <div>
                      <div className="text-sm opacity-90">Estimated XP</div>
                      <div className="text-2xl font-bold">+{estimatedXP} XP</div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-white text-[#0F52BA] rounded-lg hover:bg-white/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging...' : 'Log Activity'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
