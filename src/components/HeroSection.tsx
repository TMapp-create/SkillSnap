import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Play, Youtube, Linkedin, Facebook, Instagram, Twitter } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();

  const socialIcons = [
    { icon: Instagram, href: '#', delay: 0, color: 'from-purple-500 to-pink-500' },
    { icon: Twitter, href: '#', delay: 0.1, color: 'from-blue-400 to-blue-600' },
    { icon: Linkedin, href: '#', delay: 0.2, color: 'from-blue-600 to-blue-700' },
    { icon: Facebook, href: '#', delay: 0.3, color: 'from-blue-500 to-blue-700' },
    { icon: Youtube, href: '#', delay: 0.4, color: 'from-red-500 to-red-600' },
  ];

  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Track. Learn. Level Up.
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Master Your{' '}
              <span className="text-blue-600 dark:text-blue-400">Skills</span>
              <br />
              Earn Real{' '}
              <span className="text-blue-600 dark:text-blue-400">Experience</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Transform your learning journey into an exciting adventure. Track activities,
              earn XP, unlock badges, and showcase your achievements with professional report cards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-all text-lg"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10k+</div>
                <div>Active Users</div>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50k+</div>
                <div>Activities Tracked</div>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">8</div>
                <div>Skill Categories</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl transform rotate-6 scale-105 opacity-20 blur-2xl"></div>

              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                    <div className="bg-blue-600 p-3 rounded-xl">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">12,450</div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-semibold">+250</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['Music', 'STEM', 'Volunteer', 'Athletics'].map((category, idx) => (
                      <div key={category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{category}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${60 + idx * 10}%` }}
                              transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            Lv {3 + idx}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {[1, 2, 3, 4].map((badge) => (
                      <div key={badge} className="flex-1 p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 space-y-6">
              {socialIcons.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [0, -10, 0]
                  }}
                  transition={{
                    opacity: { delay: social.delay, duration: 0.5 },
                    x: { delay: social.delay, duration: 0.5 },
                    y: {
                      repeat: Infinity,
                      duration: 2 + idx * 0.2,
                      ease: 'easeInOut',
                      delay: social.delay
                    }
                  }}
                  className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${social.color} rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all group`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5 text-white" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-white dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}
