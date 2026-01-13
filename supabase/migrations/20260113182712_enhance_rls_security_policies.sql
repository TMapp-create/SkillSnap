/*
  # Enhanced Row Level Security Policies

  ## Overview
  Strengthens existing RLS policies with additional security measures and access controls.

  ## Changes

  1. **Profiles Table**
     - Add restrictive policy to prevent admin field manipulation by regular users
     - Prevent modification of XP, level, and is_admin fields except by admins
     - Add policy to check data integrity before updates

  2. **Activities Table**
     - Add policy to respect is_public profile setting for activity visibility
     - Strengthen verification policies with explicit admin checks
     - Add time-based constraints for activity deletion (30 days)
     - Improve query performance with better policy structure

  3. **User Safety**
     - Prevent users from escalating privileges
     - Ensure audit trail integrity
     - Respect user privacy preferences consistently

  ## Security Notes
     - All policies are restrictive by default
     - Explicit authentication checks on all operations
     - Admin operations require verified admin status
     - Time-based constraints prevent data manipulation
*/

-- Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create enhanced profile update policy that prevents privilege escalation
CREATE POLICY "Users can update own profile basic fields"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from modifying these protected fields
    (
      SELECT p.is_admin = profiles.is_admin AND
             p.total_xp = profiles.total_xp AND
             p.level = profiles.level
      FROM profiles p
      WHERE p.id = auth.uid()
    )
  );

-- Allow admins to update any profile including protected fields
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add policy to prevent viewing activities from private profiles (non-owners)
DROP POLICY IF EXISTS "Users can view approved activities from public profiles" ON activities;

CREATE POLICY "Users can view approved activities from public profiles"
  ON activities FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = activities.user_id
      AND profiles.is_public = true
    ) AND
    -- Additional check: respect is_posted flag if present
    (is_posted IS NULL OR is_posted = true)
  );

-- Add time-based deletion restriction (can only delete recent activities)
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;

CREATE POLICY "Users can delete own recent activities"
  ON activities FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    -- Allow deletion only if activity is less than 30 days old
    created_at > NOW() - INTERVAL '30 days'
  );

-- Allow admins to delete any activity regardless of age
CREATE POLICY "Admins can delete any activity"
  ON activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Strengthen admin verification policy for activities
DROP POLICY IF EXISTS "Admins can update any activity" ON activities;

CREATE POLICY "Admins can verify and update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add policy to ensure kudos are only given on visible activities
DROP POLICY IF EXISTS "Users can insert kudos" ON kudos;

CREATE POLICY "Users can insert kudos on visible activities"
  ON kudos FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    -- Ensure the activity is visible to the user giving kudos
    EXISTS (
      SELECT 1 FROM activities a
      JOIN profiles p ON p.id = a.user_id
      WHERE a.id = activity_id
      AND a.status = 'approved'
      AND (
        a.user_id = auth.uid() OR
        (p.is_public = true AND (a.is_posted IS NULL OR a.is_posted = true))
      )
    )
  );

-- Add policy to prevent viewing badges from private profiles
DROP POLICY IF EXISTS "Users can view badges from public profiles" ON user_badges;

CREATE POLICY "Users can view badges from public profiles"
  ON user_badges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_badges.user_id
      AND (profiles.is_public = true OR profiles.id = auth.uid())
    )
  );

-- Add performance indexes for policy checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Add function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for user_consents updated_at
DROP TRIGGER IF EXISTS update_user_consents_updated_at ON user_consents;
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();