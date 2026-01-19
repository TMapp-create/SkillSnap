import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, Lightbulb, Star, Download, Users, Zap, Target } from 'lucide-react';

type ResourceTab = 'guides' | 'videos' | 'practices' | 'stories';

export function ResourcesSection() {
  const [activeTab, setActiveTab] = useState<ResourceTab>('guides');

  const tabs = [
    { id: 'guides' as ResourceTab, label: 'Getting Started', icon: BookOpen },
    { id: 'videos' as ResourceTab, label: 'Video Tutorials', icon: Video },
    { id: 'practices' as ResourceTab, label: 'Best Practices', icon: Lightbulb },
    { id: 'stories' as ResourceTab, label: 'Success Stories', icon: Star },
  ];

  const resources = {
    guides: [
      {
        title: 'Quick Start Guide',
        description: 'Learn the basics of SkillSnap in under 5 minutes',
        icon: BookOpen,
        color: 'from-blue-500 to-blue-600',
      },
      {
        title: 'Activity Logging 101',
        description: 'Master the art of tracking your daily activities',
        icon: Zap,
        color: 'from-green-500 to-green-600',
      },
      {
        title: 'Setting Up Your Profile',
        description: 'Create a compelling profile that showcases your skills',
        icon: Users,
        color: 'from-purple-500 to-purple-600',
      },
      {
        title: 'Understanding XP & Levels',
        description: 'How the experience point system works',
        icon: Star,
        color: 'from-yellow-500 to-yellow-600',
      },
    ],
    videos: [
      {
        title: 'Platform Overview',
        description: '10-minute walkthrough of all major features',
        icon: Video,
        color: 'from-red-500 to-red-600',
      },
      {
        title: 'Generating Report Cards',
        description: 'Step-by-step PDF report card creation',
        icon: Download,
        color: 'from-indigo-500 to-indigo-600',
      },
      {
        title: 'Goal Setting Strategies',
        description: 'Tips for setting and achieving your skill goals',
        icon: Target,
        color: 'from-teal-500 to-teal-600',
      },
      {
        title: 'Advanced Tracking Tips',
        description: 'Power user techniques for maximum efficiency',
        icon: Lightbulb,
        color: 'from-orange-500 to-orange-600',
      },
    ],
    practices: [
      {
        title: 'Daily Activity Habits',
        description: 'Build consistent tracking routines for success',
        icon: Lightbulb,
        color: 'from-cyan-500 to-cyan-600',
      },
      {
        title: 'Category Balancing',
        description: 'How to effectively manage multiple skill categories',
        icon: BookOpen,
        color: 'from-pink-500 to-pink-600',
      },
      {
        title: 'Verification Best Practices',
        description: 'Ensure smooth admin approval of your activities',
        icon: Star,
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        title: 'Maximizing XP Gains',
        description: 'Strategic approaches to level up faster',
        icon: Zap,
        color: 'from-amber-500 to-amber-600',
      },
    ],
    stories: [
      {
        title: 'From Beginner to Expert',
        description: 'Sarah achieved 50,000 XP in her first year',
        icon: Star,
        color: 'from-violet-500 to-violet-600',
      },
      {
        title: 'College Application Success',
        description: 'How Mike used SkillSnap to stand out',
        icon: BookOpen,
        color: 'from-rose-500 to-rose-600',
      },
      {
        title: 'Multi-Category Mastery',
        description: 'Emma excelled in 6 different skill areas',
        icon: Users,
        color: 'from-lime-500 to-lime-600',
      },
      {
        title: 'Youth Mission Impact',
        description: 'David tracked his service journey',
        icon: Star,
        color: 'from-sky-500 to-sky-600',
      },
    ],
  };

  return (
    <section id="resources" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Learning Resources
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Resources to Help You Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Access helpful guides, tutorials, and inspiration to make the most of your SkillSnap journey.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {resources[activeTab].map((resource, idx) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`inline-flex p-3 bg-gradient-to-br ${resource.color} rounded-xl mb-4`}
              >
                <resource.icon className="w-6 h-6 text-white" />
              </motion.div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {resource.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {resource.description}
              </p>

              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all">
                <Download className="w-4 h-4" />
                Access Resource
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <p className="text-gray-700 dark:text-gray-300">
              Need more help?{' '}
              <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Contact our support team
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
