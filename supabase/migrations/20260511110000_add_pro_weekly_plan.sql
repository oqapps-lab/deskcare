-- Add 'pro_weekly' as a valid plan tier for deskcare_subscriptions.
-- Weekly billing is the lowest-friction trial-to-paid path for cost-sensitive
-- desk workers who want to try without committing to a month upfront.

ALTER TABLE deskcare_subscriptions
  DROP CONSTRAINT IF EXISTS deskcare_subscriptions_plan_check;

ALTER TABLE deskcare_subscriptions
  ADD CONSTRAINT deskcare_subscriptions_plan_check
  CHECK (plan IN ('free','pro_weekly','pro_monthly','pro_annual','sciatica_addon','lifetime'));
