/*
  # SkillSnap Database Schema

  ## Overview
  Complete database schema for SkillSnap - a Strava-inspired skills tracking platform for students.
  
  ## Tables Created
  
  1. **profiles**
     - Extends auth.users with student information
     - Fields: id, email, full_name, avatar_url, school, graduation_year, bio, is_admin, total_xp, level, streak, is_public, created_at, updated_at
     
  2. **categories**
     - 8 skill categories (Music, STEM, Tools & Trades, etc.)
     - Fields: id, name, slug, description, icon, xp_multiplier, color, created_at
     
  3. **activities**
     - Logged student activities with XP tracking
     - Fields: id, user_id, category_id, title, description, date, duration_hours, xp_earned, photo_url, proof_link, status (pending/approved/denied), verified_by, verified_at, created_at
     
  4. **badges**
     - Badge definitions with unlock criteria
     - Fields: id, category_id, name, description, icon, criteria, tier (bronze/silver/gold), created_at
     
  5. **user_badges**
     - Earned badges by users
     - Fields: id, user_id, badge_id, earned_at
     
  6. **kudos**
     - Likes/kudos on activities
     - Fields: id, activity_id, user_id, created_at
     
  7. **goals**
     - Custom semester/year goals per category
     - Fields: id, user_id, category_id, target_hours, target_xp, period, start_date, end_date, is_completed, completed_at, created_at
     
  8. **sub_skills**
     - Drill-down skills within categories
     - Fields: id, category_id, name, description, icon, created_at
     
  ## Security
  - RLS enabled on all tables
  - Policies for authenticated user access
  - Admin-only policies for verification
  - Public read for profiles set to public
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  school text,
  graduation_year integer,
  bio text,
  is_admin boolean DEFAULT false,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text NOT NULL,
  xp_multiplier numeric DEFAULT 1.0,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  duration_hours numeric NOT NULL,
  xp_earned integer NOT NULL,
  photo_url text,
  proof_link text,
  status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'denied')),
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view approved activities from public profiles"
  ON activities FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = activities.user_id
      AND profiles.is_public = true
    )
  );

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any activity"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  criteria jsonb NOT NULL,
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view badges from public profiles"
  ON user_badges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_badges.user_id
      AND profiles.is_public = true
    )
  );

CREATE POLICY "System can insert user badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create kudos table
CREATE TABLE IF NOT EXISTS kudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view kudos on visible activities"
  ON kudos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = kudos.activity_id
      AND (
        activities.user_id = auth.uid() OR
        (activities.status = 'approved' AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = activities.user_id
          AND profiles.is_public = true
        ))
      )
    )
  );

CREATE POLICY "Users can insert kudos"
  ON kudos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own kudos"
  ON kudos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  target_hours numeric NOT NULL,
  target_xp integer NOT NULL,
  period text DEFAULT 'semester' CHECK (period IN ('semester', 'year', 'custom')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create sub_skills table
CREATE TABLE IF NOT EXISTS sub_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sub_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sub_skills"
  ON sub_skills FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_category_id ON activities(category_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_kudos_activity_id ON kudos(activity_id);
CREATE INDEX IF NOT EXISTS idx_kudos_user_id ON kudos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, xp_multiplier, color) VALUES
  ('Music', 'music', 'Musical performance, composition, and theory', 'Music', 1.0, '#ec4899'),
  ('STEM', 'stem', 'Science, Technology, Engineering, Mathematics', 'Atom', 1.2, '#3b82f6'),
  ('Tools & Trades', 'tools-trades', 'Hands-on trades and craftsmanship', 'Wrench', 1.1, '#f97316'),
  ('Volunteer Work', 'volunteer', 'Community service and volunteering', 'Heart', 1.0, '#22c55e'),
  ('Youth Mission', 'youth-mission', 'Mission trips and faith-based service', 'Globe', 1.0, '#8b5cf6'),
  ('Driver''s Ed', 'drivers-ed', 'Driver education and training', 'Car', 0.8, '#06b6d4'),
  ('Occupational Ed', 'occupational-ed', 'Career and technical education', 'Briefcase', 1.1, '#eab308'),
  ('Athletics & Fitness', 'athletics', 'Sports, fitness, and physical activities', 'Trophy', 0.9, '#ef4444')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample badges
INSERT INTO badges (category_id, name, description, icon, criteria, tier)
SELECT 
  c.id,
  'First Steps',
  'Log your first activity in ' || c.name,
  'Award',
  '{"activities_count": 1}'::jsonb,
  'bronze'
FROM categories c
ON CONFLICT DO NOTHING;

INSERT INTO badges (category_id, name, description, icon, criteria, tier)
SELECT 
  c.id,
  'Dedicated',
  'Complete 10 activities in ' || c.name,
  'Medal',
  '{"activities_count": 10}'::jsonb,
  'silver'
FROM categories c
ON CONFLICT DO NOTHING;

INSERT INTO badges (category_id, name, description, icon, criteria, tier)
SELECT 
  c.id,
  'Master',
  'Complete 50 activities in ' || c.name,
  'Crown',
  '{"activities_count": 50}'::jsonb,
  'gold'
FROM categories c
ON CONFLICT DO NOTHING;

-- Insert sample sub-skills
INSERT INTO sub_skills (category_id, name, description, icon)
SELECT id, 'Guitar', 'Acoustic and electric guitar', 'Music' FROM categories WHERE slug = 'music'
UNION ALL
SELECT id, 'Piano', 'Classical and contemporary piano', 'Music' FROM categories WHERE slug = 'music'
UNION ALL
SELECT id, 'Vocal Performance', 'Solo and ensemble singing', 'Mic' FROM categories WHERE slug = 'music'
UNION ALL
SELECT id, 'Robotics', 'Build and program robots', 'Bot' FROM categories WHERE slug = 'stem'
UNION ALL
SELECT id, 'Coding', 'Software development', 'Code' FROM categories WHERE slug = 'stem'
UNION ALL
SELECT id, '3D Printing', 'CAD design and 3D printing', 'Box' FROM categories WHERE slug = 'stem'
UNION ALL
SELECT id, 'Woodworking', 'Carpentry and wood crafts', 'Hammer' FROM categories WHERE slug = 'tools-trades'
UNION ALL
SELECT id, 'Welding', 'Metal fabrication', 'Flame' FROM categories WHERE slug = 'tools-trades'
UNION ALL
SELECT id, 'Food Bank', 'Serve at local food banks', 'UtensilsCrossed' FROM categories WHERE slug = 'volunteer'
UNION ALL
SELECT id, 'Habitat for Humanity', 'Build homes for families', 'Home' FROM categories WHERE slug = 'volunteer'
ON CONFLICT DO NOTHING;