import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ExternalLink, Award, Shield } from 'lucide-react';
import { Activity, Badge, Profile } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function AdminVerificationPanel() {
  const { user, profile } = useAuth();
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.is_admin) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    setLoading(true);

    const { data: activities } = await supabase
      .from('activities')
      .select(`
        *,
        category:categories(*),
        profile:profiles(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (activities) setPendingActivities(activities);

    const { data: badgesData } = await supabase
      .from('badges')
      .select(`
        *,
        category:categories(*)
      `)
      .order('name');

    if (badgesData) setBadges(badgesData);

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (usersData) setUsers(usersData);

    setLoading(false);
  };

  const handleVerify = async (activityId: string, status: 'approved' | 'denied') => {
    const { error } = await supabase
      .from('activities')
      .update({
        status,
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', activityId);

    if (!error) {
      loadData();
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedUser || !selectedBadge) return;

    const { error } = await supabase.from('user_badges').insert({
      user_id: selectedUser,
      badge_id: selectedBadge,
    });

    if (!error) {
      setSelectedUser('');
      setSelectedBadge('');
      alert('Badge awarded successfully!');
    } else if (error.code === '23505') {
      alert('User already has this badge');
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="bg-[#0F52BA] dark:bg-[#1E3A8A] rounded-2xl shadow-xl p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-white/60 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Admin Access Required
        </h2>
        <p className="text-white/80">
          You need administrator privileges to access this panel.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#0F52BA] dark:bg-[#1E3A8A] rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-white/20 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0F52BA] dark:bg-[#1E3A8A] rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-white" />
          <h2 className="text-2xl font-bold text-white">
            Admin Verification Panel
          </h2>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Pending Activities ({pendingActivities.length})
          </h3>

          {pendingActivities.length === 0 ? (
            <div className="text-center py-8 text-white/80">
              No pending activities to review
            </div>
          ) : (
            <div className="space-y-4">
              {pendingActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-white">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-white/70">
                            by {activity.profile?.full_name} •{' '}
                            {activity.category?.name}
                          </p>
                        </div>
                        <div className="bg-white text-[#0F52BA] px-3 py-1 rounded-full text-sm font-bold">
                          +{activity.xp_earned} XP
                        </div>
                      </div>

                      <div className="text-sm text-white/70 mb-2">
                        <span>{new Date(activity.date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.duration_hours}h</span>
                      </div>

                      {activity.description && (
                        <p className="text-white/90 mb-3">
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

                      {activity.proof_link && (
                        <a
                          href={activity.proof_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-white hover:underline text-sm mb-3"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Proof
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVerify(activity.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#0F52BA] rounded-lg hover:bg-white/90 transition-colors font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVerify(activity.id, 'denied')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      Deny
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/20 pt-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Award Official Badge
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm"
              >
                <option value="" className="text-gray-900">Choose a user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="text-gray-900">
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Badge
              </label>
              <select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm"
              >
                <option value="" className="text-gray-900">Choose a badge</option>
                {badges.map((badge) => (
                  <option key={badge.id} value={badge.id} className="text-gray-900">
                    {badge.name} ({badge.category?.name || 'General'}) - {badge.tier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAwardBadge}
            disabled={!selectedUser || !selectedBadge}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#0F52BA] rounded-lg hover:bg-white/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Award className="w-5 h-5" />
            Award Badge
          </motion.button>
        </div>
      </div>
    </div>
  );
}
