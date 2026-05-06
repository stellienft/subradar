/*
  # Add Premium Features Schema

  ## Summary
  Extends the subscriptions system with premium features including:

  ## New Tables
  - `subscription_tags` - Custom tags users can create and assign
  - `subscription_tag_assignments` - Many-to-many between subscriptions and tags
  - `export_logs` - Tracks data exports (CSV/JSON) per user

  ## Modified Tables
  - `subscriptions`
    - `cancellation_url` already exists; adding `last_cancelled_check_at` timestamp
    - Adding `custom_category` (nullable text) for user-defined categories
    - Adding `notes` (nullable text) for user notes on each subscription
    - Adding `reminder_days_before` (int) for per-subscription reminder config

  ## Security
  - RLS enabled on all new tables
  - Policies scoped to authenticated users owning their data
*/

-- Add new columns to subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'custom_category'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN custom_category text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'notes'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN notes text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'reminder_days_before'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN reminder_days_before integer DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'last_cancelled_check_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN last_cancelled_check_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Custom tags table
CREATE TABLE IF NOT EXISTS subscription_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
  ON subscription_tags FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON subscription_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON subscription_tags FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON subscription_tags FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tag assignments (many-to-many)
CREATE TABLE IF NOT EXISTS subscription_tag_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES subscription_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscription_id, tag_id)
);

ALTER TABLE subscription_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tag assignments"
  ON subscription_tag_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.id = subscription_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tag assignments"
  ON subscription_tag_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.id = subscription_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tag assignments"
  ON subscription_tag_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.id = subscription_id AND s.user_id = auth.uid()
    )
  );

-- Export logs
CREATE TABLE IF NOT EXISTS export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_format text NOT NULL CHECK (export_format IN ('csv', 'json')),
  record_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own export logs"
  ON export_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export logs"
  ON export_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_tags_user_id ON subscription_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tag_assignments_subscription_id ON subscription_tag_assignments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_tag_assignments_tag_id ON subscription_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_user_id ON export_logs(user_id);
