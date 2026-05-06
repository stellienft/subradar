/*
  # Add unique constraint on subscriptions(user_id, name)

  Required for the ON CONFLICT upsert in the scan-gmail edge function.
*/

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_user_id_name_key UNIQUE (user_id, name);
