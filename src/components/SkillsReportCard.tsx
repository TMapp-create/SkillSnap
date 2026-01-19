import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Download, TrendingUp } from 'lucide-react';
import { CategoryStats, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SkillsReportCardProps {
  userId: string;
  userName: string;
}

export function SkillsReportCard({ userId, userName }: SkillsReportCardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesData) {
      setCategories(categoriesData);

      const statsPromises = categoriesData.map(async (category) => {
        const { data: activities } = await supabase
          .from('activities')
          .select('duration_hours, xp_earned')
          .eq('user_id', userId)
          .eq('category_id', category.id)
          .eq('status', 'approved');

        const totalHours =
          activities?.reduce((sum, a) => sum + Number(a.duration_hours), 0) || 0;
        const totalXP =
          activities?.reduce((sum, a) => sum + Number(a.xp_earned), 0) || 0;
        const activitiesCount = activities?.length || 0;

        const targetHours = 50;
        const progressPercentage = Math.min((totalHours / targetHours) * 100, 100);

        return {
          category_id: category.id,
          category,
          total_hours: totalHours,
          total_xp: totalXP,
          activities_count: activitiesCount,
          progress_percentage: progressPercentage,
        };
      });

      const statsData = await Promise.all(statsPromises);
      setStats(statsData);
    }

    setLoading(false);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('skills-report-card');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${userName}-skills-report.pdf`);
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Award;
    return Icon;
  };

  const totalXP = stats.reduce((sum, s) => sum + s.total_xp, 0);
  const totalHours = stats.reduce((sum, s) => sum + s.total_hours, 0);
  const totalActivities = stats.reduce((sum, s) => sum + s.activities_count, 0);

  if (loading) {
    return (
      <div className="bg-[#0F52BA] dark:bg-[#1E3A8A] rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-white/20 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-white/20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="skills-report-card" className="bg-[#0F52BA] dark:bg-[#1E3A8A] rounded-2xl shadow-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Skills Report Card
          </h2>
          <p className="text-white/80">
            Track your progress across all skill categories
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToPDF}
          className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-white text-[#0F52BA] rounded-lg hover:bg-white/90 transition-all font-medium shadow-lg"
        >
          <Download className="w-5 h-5" />
          Export PDF
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/20 backdrop-blur-sm text-white p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm opacity-90 font-medium">Total XP</span>
          </div>
          <div className="text-4xl font-bold">{totalXP.toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/20 backdrop-blur-sm text-white p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Icons.Clock className="w-6 h-6" />
            <span className="text-sm opacity-90 font-medium">Total Hours</span>
          </div>
          <div className="text-4xl font-bold">{totalHours.toFixed(1)}</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/20 backdrop-blur-sm text-white p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Icons.Activity className="w-6 h-6" />
            <span className="text-sm opacity-90 font-medium">Activities</span>
          </div>
          <div className="text-4xl font-bold">{totalActivities}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = getCategoryIcon(stat.category.icon);
          const radius = 50;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset =
            circumference - (stat.progress_percentage / 100) * circumference;

          return (
            <motion.div
              key={stat.category_id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/category/${stat.category_id}`)}
              className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/20"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    style={{
                      strokeDasharray: circumference,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <Icon className="w-8 h-8" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-white text-center mb-1">
                {stat.category.name}
              </h3>

              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(stat.progress_percentage)}%
                </div>
                <div className="text-xs text-white/70">
                  {stat.total_hours.toFixed(1)}h • {stat.total_xp} XP
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
