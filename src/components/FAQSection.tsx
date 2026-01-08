import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Search } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How do I get started with SkillSnap?',
      answer: 'Getting started is easy! Simply sign up for a free account, complete your profile, and start logging your activities. You can begin tracking skills across any of our 8 categories immediately. Check out our Quick Start Guide in the Resources section for a detailed walkthrough.',
    },
    {
      question: 'How is XP calculated for different activities?',
      answer: 'XP is calculated based on the time spent on an activity and the category multiplier. Each category has its own multiplier (ranging from 1.5x to 3x). For example, 1 hour of volunteer work with a 3x multiplier earns you 300 XP. The system rewards consistency and quality over quantity.',
    },
    {
      question: 'What are badges and how do I earn them?',
      answer: 'Badges are special achievements you earn by reaching specific milestones. These include completing certain hours in a category, maintaining streaks, reaching XP thresholds, or mastering specific skills. Badges appear on your profile and report cards, showcasing your dedication and accomplishments.',
    },
    {
      question: 'Can I use SkillSnap for college applications?',
      answer: 'Absolutely! SkillSnap is designed to help students showcase their skills and experiences. You can generate professional PDF report cards that detail your activities, achievements, and growth over time. Many students use these reports as part of their college applications and scholarship submissions.',
    },
    {
      question: 'What is admin verification and why is it important?',
      answer: 'Admin verification is a process where designated administrators (parents, teachers, or mentors) review and approve your logged activities. This ensures accuracy and builds credibility. Verified activities carry more weight and appear with a verification badge on your profile and reports.',
    },
    {
      question: 'How do I set and track goals?',
      answer: 'Navigate to any skill category and click the "Set Goal" button. You can create time-based goals (e.g., "Practice guitar 10 hours this month") or achievement-based goals (e.g., "Reach Level 5 in STEM"). The platform tracks your progress automatically and notifies you when goals are achieved.',
    },
    {
      question: 'Can I export my data or generate reports?',
      answer: 'Yes! You can generate comprehensive PDF report cards anytime from your dashboard. These reports include your activity history, XP breakdown, badges earned, goals achieved, and progress charts. You can customize what information to include and download or share the PDF directly.',
    },
    {
      question: 'Is SkillSnap available on mobile devices?',
      answer: 'SkillSnap is a responsive web application that works seamlessly on all devices including smartphones, tablets, and desktop computers. We recommend using the latest version of your browser for the best experience. A native mobile app is currently in development.',
    },
    {
      question: 'How do leaderboards work?',
      answer: 'Leaderboards rank users based on XP earned within specific categories or overall. You can view daily, weekly, monthly, and all-time rankings. Leaderboards are a fun way to stay motivated and celebrate achievements with your peers. You can opt out of leaderboards in your privacy settings if preferred.',
    },
    {
      question: 'What is dark mode and how do I enable it?',
      answer: 'Dark mode is a display option that uses darker colors to reduce eye strain and save battery on OLED screens. You can toggle dark mode on/off using the moon/sun icon in the navigation bar. Your preference is saved automatically and applies across all pages.',
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Yes, we take your privacy seriously. Your data is encrypted and stored securely. You control what information is visible on your profile and who can view your activities. We never share your personal data with third parties without your explicit consent. Read our Privacy Policy for complete details.',
    },
    {
      question: 'How much does SkillSnap cost?',
      answer: 'SkillSnap offers a free tier with core features including activity tracking, basic reporting, and goal setting. Premium plans with advanced features like unlimited report generation, priority verification, and detailed analytics are available at competitive rates. Check our pricing page for current plans.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Got Questions? We've Got Answers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Find quick answers to common questions about SkillSnap's features and functionality.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  {openIndex === index ? (
                    <Minus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-400" />
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No questions found matching your search.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-8"
        >
          <HelpCircle className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-blue-100 mb-6">
            Our support team is here to help you succeed with SkillSnap.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
