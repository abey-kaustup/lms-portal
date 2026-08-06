export interface LeaderboardUser {
  rank: number;
  previousRank: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  office?: string;
  avatarUrl?: string | null;
  totalPoints: number;
  coursesCompleted: number;
  lessonsCompleted?: number;
  avgAssessmentScore: number;
  badge: string;
  currentStreak?: number;
  longestStreak?: number;
  lastActivity?: string;
  isCurrentUser?: boolean;
}

export interface GamificationProfile {
  rank: number;
  previousRank: number;
  totalPoints: number;
  badge: string;
  nextBadge: string;
  pointsNeededForNextBadge: number;
  progressPercentage: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  avgAssessmentScore: number;
  currentStreak: number;
  longestStreak: number;
}

export interface AchievementItem {
  id: number;
  type: string;
  points: number;
  title: string;
  description?: string;
  earnedAt: string;
}

export interface HighlightCardsData {
  highestScorer: { name: string; code: string; value: string };
  mostCoursesCompleted: { name: string; code: string; value: string };
  highestAssessmentScore: { name: string; code: string; value: string };
  longestStreak: { name: string; code: string; value: string };
  fastestCompletion: { name: string; code: string; value: string };
}

export async function fetchTop10Leaderboard(): Promise<{ top10: LeaderboardUser[]; currentUser?: LeaderboardUser }> {
  try {
    const res = await fetch('/api/Leaderboard/top10', { cache: 'no-store' });
    if (!res.ok) return { top10: [] };
    const data = await res.json();
    return { top10: data.top10 || [], currentUser: data.currentUser };
  } catch (error) {
    console.error('Error fetching top 10 leaderboard:', error);
    return { top10: [] };
  }
}

export async function fetchTop20Leaderboard(params?: {
  departmentId?: number;
  officeId?: number;
  joiningYear?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: LeaderboardUser[]; totalRecords: number; totalPages: number }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.append('departmentId', params.departmentId.toString());
    if (params?.officeId) searchParams.append('officeId', params.officeId.toString());
    if (params?.joiningYear) searchParams.append('joiningYear', params.joiningYear.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const res = await fetch(`/api/Leaderboard/top20?${searchParams.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], totalRecords: 0, totalPages: 1 };
    const data = await res.json();
    return { data: data.data || [], totalRecords: data.totalRecords || 0, totalPages: data.totalPages || 1 };
  } catch (error) {
    console.error('Error fetching top 20 leaderboard:', error);
    return { data: [], totalRecords: 0, totalPages: 1 };
  }
}

export async function fetchMyGamificationProfile(): Promise<{ profile: GamificationProfile | null; recentAchievements: AchievementItem[] }> {
  try {
    const res = await fetch('/api/Leaderboard/me', { cache: 'no-store' });
    if (!res.ok) return { profile: null, recentAchievements: [] };
    const data = await res.json();
    return { profile: data.profile || null, recentAchievements: data.recentAchievements || [] };
  } catch (error) {
    console.error('Error fetching gamification profile:', error);
    return { profile: null, recentAchievements: [] };
  }
}

export async function fetchHighlightCards(): Promise<HighlightCardsData | null> {
  try {
    const res = await fetch('/api/Leaderboard/dashboard-cards', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.cards || null;
  } catch (error) {
    console.error('Error fetching highlight cards:', error);
    return null;
  }
}

export async function triggerRecalculateLeaderboard(): Promise<boolean> {
  try {
    const res = await fetch('/api/Leaderboard/recalculate', { method: 'POST' });
    return res.ok;
  } catch (error) {
    console.error('Error recalculating leaderboard:', error);
    return false;
  }
}
