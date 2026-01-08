import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Download, TrendingUp } from 'lucide-react';
import { CategoryStats, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

interface SkillsReportCardProps {
  userId: string;
  userName: string;
  refreshKey?: number;
}

interface ActivityWithCategory {
  id: string;
  title: string;
  date: string;
  duration_hours: number;
  xp_earned: number;
  description?: string;
  category?: Category;
}

export function SkillsReportCard({ userId, userName, refreshKey }: SkillsReportCardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allActivities, setAllActivities] = useState<ActivityWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId, refreshKey]);

  const loadData = async () => {
    setLoading(true);

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    const { data: activitiesData } = await supabase
      .from('activities')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('date', { ascending: false });

    if (activitiesData) {
      setAllActivities(activitiesData);
    }

    if (categoriesData) {
      setCategories(categoriesData);

      const statsPromises = categoriesData.map(async (category) => {
        const categoryActivities = activitiesData?.filter(
          (a) => a.category_id === category.id
        ) || [];

        const totalHours = categoryActivities.reduce(
          (sum, a) => sum + Number(a.duration_hours),
          0
        );
        const totalXP = categoryActivities.reduce(
          (sum, a) => sum + Number(a.xp_earned),
          0
        );
        const activitiesCount = categoryActivities.length;

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
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    pdf.setFillColor(15, 82, 186);
    pdf.rect(0, 0, pageWidth, 50, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Skills Report Card', margin, 25);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(userName, margin, 35);
    pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 35, { align: 'right' });

    yPos = 60;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, yPos);
    yPos += 8;

    const summaryBoxWidth = (contentWidth - 10) / 3;
    const summaryBoxes = [
      { label: 'Total XP', value: totalXP.toLocaleString() },
      { label: 'Total Hours', value: totalHours.toFixed(1) },
      { label: 'Activities', value: totalActivities.toString() },
    ];

    summaryBoxes.forEach((box, i) => {
      const x = margin + i * (summaryBoxWidth + 5);
      pdf.setFillColor(240, 244, 248);
      pdf.roundedRect(x, yPos, summaryBoxWidth, 25, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(box.label, x + summaryBoxWidth / 2, yPos + 8, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 82, 186);
      pdf.text(box.value, x + summaryBoxWidth / 2, yPos + 20, { align: 'center' });
    });

    yPos += 35;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Category Breakdown', margin, yPos);
    yPos += 8;

    pdf.setFillColor(15, 82, 186);
    pdf.rect(margin, yPos, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const catHeaders = ['Category', 'Hours', 'XP', 'Activities', 'Progress'];
    const catColWidths = [60, 25, 30, 30, 35];
    let xOffset = margin + 3;
    catHeaders.forEach((header, i) => {
      pdf.text(header, xOffset, yPos + 5.5);
      xOffset += catColWidths[i];
    });
    yPos += 8;

    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    stats.forEach((stat, i) => {
      addNewPageIfNeeded(8);
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPos, contentWidth, 8, 'F');
      }
      xOffset = margin + 3;
      pdf.setFontSize(9);
      pdf.text(stat.category.name.substring(0, 25), xOffset, yPos + 5.5);
      xOffset += catColWidths[0];
      pdf.text(stat.total_hours.toFixed(1), xOffset, yPos + 5.5);
      xOffset += catColWidths[1];
      pdf.text(stat.total_xp.toString(), xOffset, yPos + 5.5);
      xOffset += catColWidths[2];
      pdf.text(stat.activities_count.toString(), xOffset, yPos + 5.5);
      xOffset += catColWidths[3];
      pdf.text(`${Math.round(stat.progress_percentage)}%`, xOffset, yPos + 5.5);
      yPos += 8;
    });

    yPos += 10;
    addNewPageIfNeeded(30);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Activity Log', margin, yPos);
    yPos += 8;

    pdf.setFillColor(15, 82, 186);
    pdf.rect(margin, yPos, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    const actHeaders = ['Date', 'Category', 'Activity Title', 'Hours', 'XP'];
    const actColWidths = [25, 35, 75, 20, 25];
    xOffset = margin + 2;
    actHeaders.forEach((header, i) => {
      pdf.text(header, xOffset, yPos + 5.5);
      xOffset += actColWidths[i];
    });
    yPos += 8;

    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    allActivities.forEach((activity, i) => {
      addNewPageIfNeeded(8);
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPos, contentWidth, 8, 'F');
      }
      xOffset = margin + 2;
      pdf.setFontSize(8);
      const date = new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
      pdf.text(date, xOffset, yPos + 5.5);
      xOffset += actColWidths[0];
      const categoryName = activity.category?.name || 'Unknown';
      pdf.text(categoryName.substring(0, 15), xOffset, yPos + 5.5);
      xOffset += actColWidths[1];
      pdf.text(activity.title.substring(0, 35), xOffset, yPos + 5.5);
      xOffset += actColWidths[2];
      pdf.text(activity.duration_hours.toString(), xOffset, yPos + 5.5);
      xOffset += actColWidths[3];
      pdf.text(`+${activity.xp_earned}`, xOffset, yPos + 5.5);
      yPos += 8;
    });

    if (allActivities.length === 0) {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('No activities logged yet', margin + contentWidth / 2, yPos + 10, { align: 'center' });
    }

    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Generated by SkillSnap', pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.save(`${userName.replace(/\s+/g, '-')}-skills-report.pdf`);
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
