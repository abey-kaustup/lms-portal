'use client';

import React, { useEffect, useState } from 'react';
import { Award, Flame, Zap, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { GamificationProfile, AchievementItem, fetchMyGamificationProfile } from '@/lib/gamification-api';

export function GamificationProfileCard() {
  const [data, setData] = useState<{ profile: GamificationProfile | null; achievements: AchievementItem[] }>({
    profile: null,
    achievements: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchMyGamificationProfile();
      setData({ profile: res.profile, achievements: res.recentAchievements });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />;
  }

  const profile = data.profile;
  if (!profile) return null;

  const getBadgeGradient = (badge: string) => {
    switch (badge?.toLowerCase()) {
      case 'legend':
        return 'from-amber-500 to-yellow-600';
      case 'champion':
        return 'from-purple-600 to-indigo-600';
      case 'achiever':
        return 'from-amber-400 to-amber-600';
      case 'performer':
        return 'from-slate-400 to-slate-600';
      default:
        return 'from-amber-700 to-amber-900';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-soft-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-r ${getBadgeGradient(profile.badge)} text-white shadow-md`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gamification Rank
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Rank #{profile.rank > 0 ? profile.rank : 'Unranked'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {profile.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Learning Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
          <div className="text-right">
            <p className="text-xs font-black leading-none">{profile.currentStreak} Days</p>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-tight">Streak</p>
          </div>
        </div>
      </div>

      {/* Points & Badge Progress */}
      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Total Points: <strong className="text-slate-900 dark:text-slate-100 font-black">{profile.totalPoints.toLocaleString()} pts</strong>
          </span>
          {profile.pointsNeededForNextBadge > 0 ? (
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              Need {profile.pointsNeededForNextBadge} pts for {profile.nextBadge}
            </span>
          ) : (
            <span className="text-[11px] font-black text-amber-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Max Rank Achieved!
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getBadgeGradient(profile.badge)} transition-all duration-500`}
            style={{ width: `${profile.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Breakdown Row */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-xs font-black text-slate-900 dark:text-slate-100">{profile.lessonsCompleted}</p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Lessons</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-xs font-black text-slate-900 dark:text-slate-100">{profile.coursesCompleted}</p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Courses</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-xs font-black text-slate-900 dark:text-slate-100">{profile.avgAssessmentScore}%</p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Avg Score</p>
        </div>
      </div>
    </div>
  );
}
