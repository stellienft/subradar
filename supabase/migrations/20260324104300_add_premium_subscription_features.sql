/*
  # Add Premium Subscription Features

  ## Overview
  Extends the SubRadar schema to support freemium pricing model with premium subscriptions.
  Free tier: 1 account, 10 visible subscriptions
  Premium tier: $20/month for unlimited accounts and unlimited subscriptions

  ## Changes to Existing Tables
  
  ### `profiles`
  - Add `subscription_tier` (text) - 'free' or 'premium', defaults to 'free'
  - Add `subscription_status` (text) - 'active', 'past_due', 'canceled', 'trialing'
  - Add `stripe_customer_id` (text) - Stripe customer reference
  - Add `stripe_subscription_id` (text) - Active Stripe subscription reference
  - Add `subscription_started_at` (timestamptz) - When premium subscription began
  - Add `subscription_ends_at` (timestamptz) - When subscription ends (for canceled)
  - Add `max_accounts_allowed` (integer) - Account limit (1 for free, 999 for premium)

  ## New Tables

  ### `linked_accounts`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `email_provider` (text) - 'gmail', 'outlook', etc.
  - `email_address` (text) - The linked email address
  - `access_token_encrypted` (text) - Encrypted OAuth access token
  - `refresh_token_encrypted` (text) - Encrypted OAuth refresh token
  - `is_primary` (boolean) - Whether this is the primary account
  - `last_scan_at` (timestamptz) - Last time account was scanned
  - `connected_at` (timestamptz) - When account was connected
  - `status` (text) - 'connected', 'expired', 'scanning', 'error'
  - `subscription_count` (integer) - Number of subscriptions found in this account

  ### `user_settings`
  - `user_id` (uuid, primary key, foreign key to profiles)
  - `email_notifications` (boolean) - Enable email alerts
  - `weekly_reports_enabled` (boolean) - Enable weekly summary emails
  - `payment_reminders` (boolean) - Reminders before payments
  - `currency_preference` (text) - Preferred currency display
  - `theme_preference` (text) - 'light', 'dark', 'system'
  - `notifications_enabled` (boolean) - Master notification toggle
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own linked accounts and settings
  - All policies check authentication and ownership
*/

-- Add premium subscription fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'max_accounts_allowed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN max_accounts_allowed integer DEFAULT 1;
  END IF;
END $$;

-- Create linked_accounts table
CREATE TABLE IF NOT EXISTS linked_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_provider text NOT NULL,
  email_address text NOT NULL,
  access_token_encrypted text,
  refresh_token_encrypted text,
  is_primary boolean DEFAULT false,
  last_scan_at timestamptz,
  connected_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'scanning', 'error')),
  subscription_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, email_address)
);

ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own linked accounts"
  ON linked_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own linked accounts"
  ON linked_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own linked accounts"
  ON linked_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own linked accounts"
  ON linked_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  weekly_reports_enabled boolean DEFAULT true,
  payment_reminders boolean DEFAULT true,
  currency_preference text DEFAULT 'USD',
  theme_preference text DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_status ON linked_accounts(status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_linked_accounts_updated_at
  BEFORE UPDATE ON linked_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add linked_account_id to subscriptions table to track which account found each subscription
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'linked_account_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN linked_account_id uuid REFERENCES linked_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_linked_account_id ON subscriptions(linked_account_id);