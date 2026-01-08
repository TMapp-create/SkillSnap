/*
  # Add Public Posting Feature to Activities

  1. Changes
    - Add `is_posted` boolean field to activities table
      - Defaults to false (private activity)
      - When true, activity is visible in public community feeds
      - Allows users to choose which activities to share publicly
    
  2. Security
    - No RLS changes needed - existing policies handle visibility
    - Posted activities (is_posted = true) already visible via existing "approved activities from public profiles" policy
    
  3. Performance
    - Add index on is_posted field for efficient querying of public feed
    - Combined index on (is_posted, created_at) for optimal feed performance
*/

-- Add is_posted field to activities table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'is_posted'
  ) THEN
    ALTER TABLE activities ADD COLUMN is_posted boolean DEFAULT false;
  END IF;
END $$;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_activities_is_posted ON activities(is_posted) WHERE is_posted = true;
CREATE INDEX IF NOT EXISTS idx_activities_posted_date ON activities(is_posted, created_at DESC) WHERE is_posted = true;