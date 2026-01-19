import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Award, TrendingUp, FileText, Users, Target, Shield, Moon } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: 'XP Tracking System',
      description: 'Earn experience points for every activity you complete. Watch your progress grow with dynamic multipliers across different skill categories.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Award,
      title: 'Badge Achievements',
      description: 'Unlock special badges as you reach milestones. Showcase your accomplishments and celebrate your dedication to skill development.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Progress Visualization',
      description: 'View detailed charts and graphs that show your growth over time. Identify trends and areas for improvement at a glance.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'PDF Report Cards',
      description: 'Generate professional report cards showcasing your skills and achievements. Perfect for applications, portfolios, and sharing success.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      title: 'Leaderboards',
      description: 'Compete with friends and peers on category-specific leaderboards. Stay motivated by tracking your rank and celebrating top performers.',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set personalized goals for each skill category. Track your progress toward targets and receive notifications when you achieve them.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Shield,
      title: 'Activity Verification',
      description: 'Admin verification ensures all logged activities are legitimate. Build trust and credibility with verified skill tracking.',
      color: 'from-teal-500 to-green-500',
    },
    {
      icon: Moon,
      title: 'Dark Mode Support',
      description: 'Seamlessly switch between light and dark themes. Enjoy a comfortable viewing experience any time of day or night.',
      color: 'from-slate-600 to-slate-800',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Powerful Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A comprehensive platform designed to help you track, measure, and showcase your skills
            with professional-grade tools and features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all h-full border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.div
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all"
                    whileHover={{ x: 5 }}
                  >
                    Explore feature →
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Experience These Features?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already tracking their skills and achieving their goals
            with SkillSnap's powerful platform.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Start Your Free Trial
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
