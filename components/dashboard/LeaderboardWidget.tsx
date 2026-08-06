'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Award, ArrowUpRight, ArrowDownRight, Flame, Shield, Star, RefreshCw } from 'lucide-react';
import { LeaderboardUser, fetchTop10Leaderboard } from '@/lib/gamification-api';

export function LeaderboardWidget() {
  const [top10, setTop10] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchTop10Leaderboard();
    setTop10(result.top10);
    if (result.currentUser) {
      setCurrentUser(result.currentUser);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-black text-xs shadow-md">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black text-xs shadow-md">
          🥉
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
        {rank}
      </span>
    );
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge?.toLowerCase()) {
      case 'legend':
        return <span className="text-amber-500 font-bold text-xs flex items-center gap-1">👑 Legend</span>;
      case 'champion':
        return <span className="text-purple-500 font-bold text-xs flex items-center gap-1">💎 Champion</span>;
      case 'achiever':
        return <span className="text-amber-400 font-bold text-xs flex items-center gap-1">🥇 Achiever</span>;
      case 'performer':
        return <span className="text-slate-400 font-bold text-xs flex items-center gap-1">🥈 Performer</span>;
      default:
        return <span className="text-amber-700 font-bold text-xs flex items-center gap-1">🥉 Learner</span>;
    }
  };

  const getRankChangeIndicator = (currentRank: number, previousRank: number) => {
    if (!previousRank || previousRank === currentRank) return null;
    if (currentRank < previousRank) {
      return (
        <span className="inline-flex items-center text-[10px] font-bold text-emerald-500 animate-pulse">
          <ArrowUpRight className="w-3 h-3" />
          {previousRank - currentRank}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-bold text-red-500">
        <ArrowDownRight className="w-3 h-3" />
        {currentRank - previousRank}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-soft-sm border border-slate-200/80 dark:border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Top 10 Leaderboard
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Real-time LMS Points Ranking</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh rankings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Leaderboard Table / List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[260px]">
        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : top10.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">No leaderboard entries yet.</div>
        ) : (
          <>
            {top10.map((user) => {
              const isTop3 = user.rank <= 3;
              const isCurrentUser = user.isCurrentUser;

              return (
                <div
                  key={user.employeeId}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                    isCurrentUser
                      ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/30 animate-pulse-subtle'
                      : isTop3
                      ? 'bg-gradient-to-r from-slate-50 via-amber-50/20 to-slate-50 dark:from-slate-800/40 dark:via-amber-950/10 dark:to-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:scale-[1.01]'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Left: Rank & User Details */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      {getRankBadge(user.rank)}
                      {getRankChangeIndicator(user.rank, user.previousRank)}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user.employeeName}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {user.employeeCode} • {user.department}
                      </p>
                    </div>
                  </div>

                  {/* Right: Badge & Points */}
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                      {user.totalPoints.toLocaleString()} <span className="text-[10px] font-bold text-amber-500">pts</span>
                    </div>
                    <div>{getBadgeIcon(user.badge)}</div>
                  </div>
                </div>
              );
            })}

            {/* If Logged In User is outside Top 10 */}
            {currentUser && !top10.some((u) => u.employeeId === currentUser.employeeId) && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 mt-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-500 shadow-md shadow-blue-500/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      {getRankBadge(currentUser.rank)}
                      {getRankChangeIndicator(currentUser.rank, currentUser.previousRank)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {currentUser.employeeName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white uppercase">
                          You
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {currentUser.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                      {currentUser.totalPoints.toLocaleString()}{' '}
                      <span className="text-[10px] font-bold text-amber-500">pts</span>
                    </div>
                    <div>{getBadgeIcon(currentUser.badge)}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
