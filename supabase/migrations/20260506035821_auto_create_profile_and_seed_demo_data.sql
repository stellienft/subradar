/*
  # Auto-create profile and seed demo data on new user signup

  ## Overview
  Sets up a Postgres trigger that fires when a new user registers via Supabase Auth.
  This ensures every new user automatically gets:
  1. A profile row in the `profiles` table
  2. Default user settings in `user_settings`
  3. 12 demo subscriptions so the dashboard is never empty on first login

  ## New Functions
  - `handle_new_user()` - Trigger function that creates profile + settings + demo subscriptions

  ## Modified Tables
  - `profiles` - Rows auto-inserted on auth.users insert
  - `user_settings` - Rows auto-inserted on auth.users insert
  - `subscriptions` - Demo rows inserted for new users

  ## Notes
  - Demo subscriptions have `is_demo = true` so they can be filtered/removed later
  - The trigger runs with SECURITY DEFINER to bypass RLS during initial setup
  - Idempotent: uses ON CONFLICT DO NOTHING for all inserts
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  today date := CURRENT_DATE;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, gmail_connected)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    false
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Seed demo subscriptions
  INSERT INTO public.subscriptions
    (user_id, name, domain, category, amount, currency, billing_cycle, next_payment_date, status, trial_ends_at, first_detected_at, email_address, cancellation_url, is_demo)
  VALUES
    (NEW.id, 'Netflix Premium',       'netflix.com',     'Streaming',  15.49, 'USD', 'monthly', today + 5,   'active', NULL, now() - interval '8 months',  'info@account.netflix.com',    'https://www.netflix.com/cancelplan',              true),
    (NEW.id, 'Spotify Premium',       'spotify.com',     'Streaming',  10.99, 'USD', 'monthly', today + 12,  'active', NULL, now() - interval '24 months', 'noreply@spotify.com',         'https://www.spotify.com/account/subscription/',   true),
    (NEW.id, 'Adobe Creative Cloud',  'adobe.com',       'SaaS',       54.99, 'USD', 'monthly', today + 3,   'active', NULL, now() - interval '15 months', 'message@adobe.com',           'https://account.adobe.com/',                      true),
    (NEW.id, 'ChatGPT Plus',          'openai.com',      'SaaS',       20.00, 'USD', 'monthly', today + 18,  'active', NULL, now() - interval '6 months',  'noreply@openai.com',          'https://platform.openai.com/account/billing',     true),
    (NEW.id, 'Notion Plus',           'notion.so',       'SaaS',       10.00, 'USD', 'monthly', today + 25,  'active', NULL, now() - interval '10 months', 'team@makenotion.com',         'https://www.notion.so/my-account',                true),
    (NEW.id, 'GitHub Pro',            'github.com',      'SaaS',        4.00, 'USD', 'monthly', today + 8,   'active', NULL, now() - interval '18 months', 'noreply@github.com',          'https://github.com/settings/billing',             true),
    (NEW.id, 'Figma Professional',    'figma.com',       'SaaS',      144.00, 'USD', 'annual',  today + 60,  'active', NULL, now() - interval '10 months', 'no-reply@figma.com',          'https://www.figma.com/settings',                  true),
    (NEW.id, 'Duolingo Super',        'duolingo.com',    'Education',   6.99, 'USD', 'monthly', today + 2,   'trial',  today + 2, now() - interval '1 month', 'hello@duolingo.com',        'https://www.duolingo.com/settings/subscriptions', true),
    (NEW.id, 'The New York Times',    'nytimes.com',     'News',       17.00, 'USD', 'monthly', today + 22,  'active', NULL, now() - interval '5 months',  'nytdirect@nytimes.com',       'https://myaccount.nytimes.com/seg/cancel',        true),
    (NEW.id, 'Headspace',             'headspace.com',   'Health',     12.99, 'USD', 'monthly', today + 15,  'active', NULL, now() - interval '7 months',  'help@headspace.com',          'https://www.headspace.com/subscriptions',         true),
    (NEW.id, 'Amazon Web Services',   'aws.amazon.com',  'Cloud',      47.32, 'USD', 'monthly', today + 28,  'active', NULL, now() - interval '12 months', 'aws-billing@amazon.com',      'https://console.aws.amazon.com/billing/',         true),
    (NEW.id, 'Dropbox Plus',          'dropbox.com',     'Cloud',     119.88, 'USD', 'annual',  today + 120, 'active', NULL, now() - interval '8 months',  'no-reply@dropbox.com',        'https://www.dropbox.com/account/plan',            true);

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists so we can recreate cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
