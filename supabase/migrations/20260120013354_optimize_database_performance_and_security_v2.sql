/*
  # Optimize Database Performance and Security

  ## Performance Improvements

  ### 1. Add Missing Foreign Key Indexes
  - `activities.verified_by` - improves admin activity queries
  - `badges.category_id` - improves badge category lookups
  - `goals.category_id` - improves goal category queries
  - `sub_skills.category_id` - improves sub-skill category queries
  - `user_badges.badge_id` - improves badge lookup performance

  ### 2. Optimize RLS Policies with Initialization
  Replace `auth.uid()` with `(select auth.uid())` in all RLS policies to prevent
  re-evaluation for each row, significantly improving query performance at scale.
  
  Affected tables:
  - profiles (5 policies)
  - activities (5 policies)
  - user_badges (3 policies)
  - kudos (3 policies)
  - goals (4 policies)
  - policies (2 policies)
  - user_consents (4 policies)

  ### 3. Fix Function Search Path
  Update `update_updated_at_column` function to have an immutable search path
  by recreating it with CASCADE and then recreating the triggers

  ## Security Notes
  - All existing security constraints are maintained
  - RLS policies are recreated with same logic but better performance
  - No changes to data access patterns or permissions
*/

-- Add missing foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_verified_by ON activities(verified_by);
CREATE INDEX IF NOT EXISTS idx_badges_category_id ON badges(category_id);
CREATE INDEX IF NOT EXISTS idx_goals_category_id ON goals(category_id);
CREATE INDEX IF NOT EXISTS idx_sub_skills_category_id ON sub_skills(category_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Fix function search path to be immutable (drop cascade to remove dependent triggers)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optimize profiles table RLS policies
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile basic fields" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_public = true OR (select auth.uid()) = id);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile basic fields"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id AND NOT (is_admin IS DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = (select auth.uid()))));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true);

-- Optimize activities table RLS policies
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can view approved activities from public profiles" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Admins can verify and update activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own recent activities" ON activities;
DROP POLICY IF EXISTS "Admins can delete any activity" ON activities;

CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can view approved activities from public profiles"
  ON activities FOR SELECT
  TO authenticated
  USING (
    status = 'approved' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = activities.user_id 
      AND profiles.is_public = true
    )
  );

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can verify and update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true);

CREATE POLICY "Users can delete own recent activities"
  ON activities FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()) AND created_at > now() - interval '24 hours');

CREATE POLICY "Admins can delete any activity"
  ON activities FOR DELETE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true);

-- Optimize user_badges table RLS policies
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view badges from public profiles" ON user_badges;
DROP POLICY IF EXISTS "System can insert user badges" ON user_badges;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

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
  WITH CHECK (user_id = (select auth.uid()));

-- Optimize kudos table RLS policies
DROP POLICY IF EXISTS "Users can view kudos on visible activities" ON kudos;
DROP POLICY IF EXISTS "Users can insert kudos on visible activities" ON kudos;
DROP POLICY IF EXISTS "Users can delete own kudos" ON kudos;

CREATE POLICY "Users can view kudos on visible activities"
  ON kudos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM activities 
      WHERE activities.id = kudos.activity_id 
      AND (
        activities.user_id = (select auth.uid())
        OR (
          activities.status = 'approved' 
          AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = activities.user_id 
            AND profiles.is_public = true
          )
        )
      )
    )
  );

CREATE POLICY "Users can insert kudos on visible activities"
  ON kudos FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM activities 
      WHERE activities.id = kudos.activity_id 
      AND activities.status = 'approved'
    )
  );

CREATE POLICY "Users can delete own kudos"
  ON kudos FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Optimize goals table RLS policies
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Optimize policies table RLS policies
DROP POLICY IF EXISTS "Admins can insert policies" ON policies;
DROP POLICY IF EXISTS "Admins can update policies" ON policies;

CREATE POLICY "Admins can insert policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true);

CREATE POLICY "Admins can update policies"
  ON policies FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true);

-- Optimize user_consents table RLS policies
DROP POLICY IF EXISTS "Users can view own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can insert own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can update own consents" ON user_consents;
DROP POLICY IF EXISTS "Admins can view all consents" ON user_consents;

CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own consents"
  ON user_consents FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true);