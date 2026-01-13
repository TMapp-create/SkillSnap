export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  school?: string;
  graduation_year?: number;
  bio?: string;
  is_admin: boolean;
  total_xp: number;
  level: number;
  streak: number;
  is_public: boolean;
  accepted_terms_version?: string;
  accepted_privacy_version?: string;
  last_policy_check_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  xp_multiplier: number;
  color: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string;
  date: string;
  duration_hours: number;
  xp_earned: number;
  photo_url?: string;
  proof_link?: string;
  status: 'pending' | 'approved' | 'denied';
  verified_by?: string;
  verified_at?: string;
  is_posted: boolean;
  created_at: string;
  category?: Category;
  profile?: Profile;
  kudos_count?: number;
  user_has_kudoed?: boolean;
}

export interface Badge {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  icon: string;
  criteria: {
    activities_count?: number;
    xp_amount?: number;
    hours_amount?: number;
  };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
  category?: Category;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Kudos {
  id: string;
  activity_id: string;
  user_id: string;
  created_at: string;
  profile?: Profile;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id: string;
  target_hours: number;
  target_xp: number;
  period: 'semester' | 'year' | 'custom';
  start_date: string;
  end_date: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  category?: Category;
  current_hours?: number;
  current_xp?: number;
  progress_percentage?: number;
}

export interface SubSkill {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  icon: string;
  created_at: string;
}

export interface CategoryStats {
  category_id: string;
  category: Category;
  total_hours: number;
  total_xp: number;
  activities_count: number;
  progress_percentage: number;
}

export interface LeaderboardEntry {
  user_id: string;
  profile: Profile;
  total_xp: number;
  activities_count: number;
  rank: number;
}

export interface Policy {
  id: string;
  policy_type: 'terms_of_service' | 'privacy_policy' | 'cookie_policy';
  version: string;
  content: string;
  effective_date: string;
  created_at: string;
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface UserConsent {
  id: string;
  user_id: string;
  terms_version?: string;
  privacy_version?: string;
  cookie_version?: string;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
  cookie_accepted_at?: string;
  cookie_preferences: CookiePreferences;
  created_at: string;
  updated_at: string;
}
