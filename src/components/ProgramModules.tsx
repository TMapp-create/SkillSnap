import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Atom, Wrench, Heart, Globe, Car, Briefcase, Dumbbell, Zap, X } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  icon: any;
  description: string;
  xpMultiplier: string;
  color: string;
  bgLight: string;
  bgDark: string;
  features: string[];
}

export function ProgramModules() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const programs: Program[] = [
    {
      id: 1,
      name: 'Music',
      icon: Music,
      description: 'Master instruments, vocals, and music theory with structured practice tracking',
      xpMultiplier: '2x',
      color: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-900/20',
      features: ['Instrument practice tracking', 'Vocal lessons', 'Music theory progress', 'Performance recordings'],
    },
    {
      id: 2,
      name: 'STEM',
      icon: Atom,
      description: 'Excel in Science, Technology, Engineering, and Mathematics disciplines',
      xpMultiplier: '2.5x',
      color: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      features: ['Lab experiments', 'Coding projects', 'Problem sets', 'Research papers'],
    },
    {
      id: 3,
      name: 'Tools & Trades',
      icon: Wrench,
      description: 'Build practical skills in woodworking, metalworking, and technical trades',
      xpMultiplier: '2x',
      color: 'from-orange-500 to-red-500',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      features: ['Woodworking projects', 'Metalworking techniques', 'Automotive skills', 'Tool certifications'],
    },
    {
      id: 4,
      name: 'Volunteer Work',
      icon: Heart,
      description: 'Make a difference through community service and charitable activities',
      xpMultiplier: '3x',
      color: 'from-red-500 to-pink-500',
      bgLight: 'bg-red-50',
      bgDark: 'dark:bg-red-900/20',
      features: ['Community service', 'Charity events', 'Mentoring programs', 'Impact tracking'],
    },
    {
      id: 5,
      name: 'Youth Mission',
      icon: Globe,
      description: 'Develop leadership and service skills through mission experiences',
      xpMultiplier: '3x',
      color: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      features: ['Leadership training', 'Mission trips', 'Cultural exchange', 'Service projects'],
    },
    {
      id: 6,
      name: "Driver's Ed",
      icon: Car,
      description: 'Track driving practice hours and safety education progress',
      xpMultiplier: '1.5x',
      color: 'from-yellow-500 to-orange-500',
      bgLight: 'bg-yellow-50',
      bgDark: 'dark:bg-yellow-900/20',
      features: ['Practice hour logging', 'Safety courses', 'Road test prep', 'License tracking'],
    },
    {
      id: 7,
      name: 'Occupational Ed',
      icon: Briefcase,
      description: 'Gain career readiness through vocational training and work experience',
      xpMultiplier: '2x',
      color: 'from-indigo-500 to-blue-500',
      bgLight: 'bg-indigo-50',
      bgDark: 'dark:bg-indigo-900/20',
      features: ['Career exploration', 'Job shadowing', 'Resume building', 'Interview prep'],
    },
    {
      id: 8,
      name: 'Athletics & Fitness',
      icon: Dumbbell,
      description: 'Track workouts, sports practice, and physical fitness achievements',
      xpMultiplier: '1.5x',
      color: 'from-teal-500 to-green-500',
      bgLight: 'bg-teal-50',
      bgDark: 'dark:bg-teal-900/20',
      features: ['Workout logging', 'Sports training', 'Fitness goals', 'Performance metrics'],
    },
  ];

  return (
    <section id="programs" className="py-20 bg-white dark:bg-gray-900">
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
              8 Skill Categories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Path
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore diverse skill categories designed to help you grow, achieve, and stand out.
            Each module offers unique challenges and rewards.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program, idx) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
              onClick={() => setSelectedProgram(program)}
            >
              <div className={`relative ${program.bgLight} ${program.bgDark} rounded-2xl p-6 border-2 border-transparent hover:border-blue-600 dark:hover:border-blue-400 transition-all shadow-lg hover:shadow-2xl cursor-pointer h-full`}>
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 bg-gradient-to-r ${program.color} rounded-full text-white text-xs font-bold`}>
                    {program.xpMultiplier} XP
                  </div>
                </div>

                <div className={`inline-flex p-4 bg-gradient-to-br ${program.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <program.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {program.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {program.description}
                </p>

                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  Learn More
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/10 rounded-2xl transition-all pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Can't decide? You can track activities across{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">all categories</span>
            {' '}simultaneously!
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProgram(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${selectedProgram.color} p-8 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <selectedProgram.icon className="w-12 h-12" />
                  <button
                    onClick={() => setSelectedProgram(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <h2 className="text-3xl font-bold mb-2">{selectedProgram.name}</h2>
                <p className="text-white/90 text-sm">{selectedProgram.description}</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white text-xs font-bold">
                    {selectedProgram.xpMultiplier} XP Multiplier
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Features:</h3>
                <ul className="space-y-3 mb-6">
                  {selectedProgram.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedProgram.color}`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 bg-gradient-to-r ${selectedProgram.color} text-white font-semibold rounded-lg hover:shadow-lg transition-shadow`}>
                  Start Tracking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
