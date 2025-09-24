-- Migration: Create usage tracking tables for Public Beta
-- This migration sets up the foundation for usage tracking without payment integration

-- Create user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    plan_type VARCHAR NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium', 'enterprise')),
    status VARCHAR NOT NULL DEFAULT 'beta' CHECK (status IN ('active', 'beta')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create usage_events table (immutable audit trail)
CREATE TABLE IF NOT EXISTS usage_events (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    event_type VARCHAR NOT NULL CHECK (event_type IN (
        'game_created',
        'question_generated',
        'ai_question_generated',
        'player_submission',
        'analytics_viewed',
        'export_used',
        'custom_theme_applied'
    )),
    resource_id VARCHAR,
    metadata JSONB,
    cost_units DECIMAL(10,4) DEFAULT 0.0000,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create usage_counters table (real-time counters for performance)
CREATE TABLE IF NOT EXISTS usage_counters (
    user_id VARCHAR PRIMARY KEY,
    current_period_games_created INTEGER DEFAULT 0,
    current_period_questions_generated INTEGER DEFAULT 0,
    current_period_ai_questions INTEGER DEFAULT 0,
    current_period_player_submissions INTEGER DEFAULT 0,
    current_period_analytics_views INTEGER DEFAULT 0,
    current_period_exports INTEGER DEFAULT 0,
    current_period_custom_themes INTEGER DEFAULT 0,
    last_reset_date TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create feature_limits table (configurable limits per plan)
CREATE TABLE IF NOT EXISTS feature_limits (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type VARCHAR NOT NULL CHECK (plan_type IN ('free', 'premium', 'enterprise')),
    feature_type VARCHAR NOT NULL,
    monthly_limit INTEGER NOT NULL,
    included_in_plan BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_recorded_at ON usage_events(recorded_at);
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_limits_plan_type ON feature_limits(plan_type);

-- Insert Public Beta limits
INSERT INTO feature_limits (plan_type, feature_type, monthly_limit, description) VALUES
('free', 'game_created', 10, 'Maximum games that can be created per month'),
('free', 'question_generated', 15, 'Maximum questions per game'),
('free', 'analytics_views', 100, 'Maximum analytics views per month'),
('free', 'exports', 10, 'Maximum exports per month'),
('free', 'ai_question_generated', 100, 'Maximum AI-generated questions per month'),
('free', 'player_submission', 1000, 'Maximum player submissions per month'),
('free', 'custom_theme_applied', 5, 'Maximum custom theme applications per month')
ON CONFLICT DO NOTHING;

-- TODO: Payment Integration - Add indexes and constraints for payment-related fields later
-- CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_subscription_id ON user_plans(stripe_subscription_id);
-- ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR;
-- ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS billing_cycle_start TIMESTAMP;
-- ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS billing_cycle_end TIMESTAMP;

-- Create a function to reset monthly usage (to be called by cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
    UPDATE usage_counters 
    SET 
        current_period_games_created = 0,
        current_period_questions_generated = 0,
        current_period_ai_questions = 0,
        current_period_player_submissions = 0,
        current_period_analytics_views = 0,
        current_period_exports = 0,
        current_period_custom_themes = 0,
        last_reset_date = DATE_TRUNC('month', CURRENT_DATE),
        updated_at = NOW()
    WHERE last_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Create a view for user usage summary
CREATE OR REPLACE VIEW user_usage_summary AS
SELECT 
    u.user_id,
    u.current_period_games_created as games_created,
    u.current_period_questions_generated as questions_generated,
    u.current_period_analytics_views as analytics_views,
    u.current_period_exports as exports,
    p.plan_type,
    p.status
FROM usage_counters u
LEFT JOIN user_plans p ON u.user_id = p.user_id;

-- Log migration completion
DO $$ 
BEGIN
    RAISE NOTICE 'Usage tracking migration completed successfully';
END $$;
