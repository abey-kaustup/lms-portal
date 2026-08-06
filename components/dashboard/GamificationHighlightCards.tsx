'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, BookOpen, Star, Flame, Zap } from 'lucide-react';
import { HighlightCardsData, fetchHighlightCards } from '@/lib/gamification-api';

export function GamificationHighlightCards() {
  const [data, setData] = useState<HighlightCardsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchHighlightCards();
      setData(res);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const items = [
    {
      title: 'Highest Scorer',
      name: data.highestScorer.name,
      code: data.highestScorer.code,
      value: data.highestScorer.value,
      icon: Trophy,
      color: 'amber',
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    },
    {
      title: 'Most Courses',
      name: data.mostCoursesCompleted.name,
      code: data.mostCoursesCompleted.code,
      value: data.mostCoursesCompleted.value,
      icon: BookOpen,
      color: 'blue',
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    },
    {
      title: 'Highest Quiz Score',
      name: data.highestAssessmentScore.name,
      code: data.highestAssessmentScore.code,
      value: data.highestAssessmentScore.value,
      icon: Star,
      color: 'emerald',
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    },
    {
      title: 'Longest Streak',
      name: data.longestStreak.name,
      code: data.longestStreak.code,
      value: data.longestStreak.value,
      icon: Flame,
      color: 'purple',
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
    },
    {
      title: 'Fastest Completion',
      name: data.fastestCompletion.name,
      code: data.fastestCompletion.code,
      value: data.fastestCompletion.value,
      icon: Zap,
      color: 'rose',
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {items.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {item.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${item.bg} shrink-0`}>
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
            <div className="flex items-center justify-between text-[11px] mt-1">
              <span className="text-slate-400 font-medium">{item.code}</span>
              <span className="font-black text-slate-900 dark:text-slate-100 font-mono">{item.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
