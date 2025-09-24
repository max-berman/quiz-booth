# Usage Tracking Implementation - Public Beta Foundation

This document outlines the usage tracking system implemented for the Quiz Booth Public Beta. The system is designed to track usage without enforcing hard limits during the beta phase, while providing the foundation for future payment integration.

## Overview

The usage tracking system consists of:

1. **Database Schema** - PostgreSQL tables for tracking usage
2. **Usage Tracker Service** - Core logic for recording and checking usage
3. **API Endpoints** - REST endpoints for usage data
4. **Integration** - Usage tracking integrated into existing game creation flows

## Database Schema

### Tables Created

#### `user_plans`

- Tracks user subscription status (currently all users are "free" plan during beta)
- Placeholder for future Stripe subscription fields

#### `usage_events`

- Immutable audit trail of all usage events
- Records detailed metadata for each action

#### `usage_counters`

- Real-time counters for fast usage queries
- Reset monthly for billing cycles

#### `feature_limits`

- Configurable limits per plan type
- Pre-populated with Public Beta limits

### Public Beta Limits

During the Public Beta, users have the following limits:

- **10 games per month**
- **15 questions per game**
- **100 analytics views per month**
- **10 exports per month**
- **100 AI-generated questions per month**
- **1000 player submissions per month**
- **5 custom theme applications per month**

## API Endpoints

### Usage Tracking Endpoints

- `GET /api/user/usage` - Get current usage summary
- `GET /api/user/usage/check/:feature` - Check if user can perform an action
- `POST /api/user/usage/initialize` - Initialize user plan (called on signup)

### Integrated Usage Tracking

The following actions automatically track usage:

- **Game Creation** (`POST /api/games`) - Tracks `game_created` events
- **AI Question Generation** (`POST /api/games/:id/generate-questions`) - Tracks `ai_question_generated` events
- **Single Question Generation** (`POST /api/games/:id/generate-single-question`) - Tracks `ai_question_generated` events

## Implementation Details

### Soft Limits During Beta

During the Public Beta phase:

- **All limits are soft** - Users can exceed limits but receive warnings
- **No blocking** - Functionality continues even when limits are exceeded
- **Warning messages** - Users see warnings at 80% and 100% of limits
- **Usage transparency** - Users can see their current usage via the API

### Usage Tracker Service

The `UsageTracker` class provides:

- `recordEvent()` - Records usage events and updates counters
- `checkBetaLimit()` - Checks limits and returns warnings
- `getUserUsageSummary()` - Gets comprehensive usage data
- `initializeUserPlan()` - Sets up new users with free plan

## Future Payment Integration

### TODO: Payment Integration Points

The system is designed to support seamless payment integration later:

#### Database Schema Updates Needed

```sql
-- Add Stripe fields to user_plans
ALTER TABLE user_plans ADD COLUMN stripe_subscription_id VARCHAR;
ALTER TABLE user_plans ADD COLUMN billing_cycle_start TIMESTAMP;
ALTER TABLE user_plans ADD COLUMN billing_cycle_end TIMESTAMP;

-- Add overage rates to feature_limits
ALTER TABLE feature_limits ADD COLUMN overage_rate DECIMAL(10,4);
```

#### Usage Tracker Updates Needed

- Implement `calculateOverageCost()` method
- Implement `triggerOverageBilling()` method
- Add `handleSubscriptionChanges()` for webhooks
- Add `getBillingPortalUrl()` for user self-service

#### API Endpoints to Add

- `POST /api/user/billing/portal` - Get billing portal URL
- `POST /api/user/billing/subscribe` - Create subscription
- `POST /api/user/billing/cancel` - Cancel subscription
- `GET /api/user/billing/invoices` - Get billing history

### Transition Strategy

When ready to implement payments:

1. **Update database schema** with payment fields
2. **Implement billing logic** in UsageTracker
3. **Add billing API endpoints**
4. **Update UI** to show hard limits and payment options
5. **Migrate existing users** to appropriate plans

## Running the Migration

To set up the usage tracking database:

```bash
# Apply the migration
psql $DATABASE_URL -f migrations/001_usage_tracking.sql

# Or use Drizzle Kit (if configured)
npm run db:push
```

## Monitoring Usage

### Usage Summary View

The database includes a `user_usage_summary` view that provides:

- Current usage for all features
- Plan type and status
- Easy querying for analytics

### Monthly Reset

The `reset_monthly_usage()` function should be called monthly (via cron job) to reset counters.

## Testing

The system includes comprehensive error handling:

- Graceful degradation during beta
- Null-safe field access
- Error logging for debugging
- Fallback to allowing actions if tracking fails

## Next Steps

1. **Deploy the migration** to set up the database
2. **Test usage tracking** with real user actions
3. **Monitor usage patterns** during beta
4. **Gather user feedback** on limits and pricing
5. **Implement payment integration** when ready

This foundation provides robust usage tracking while maintaining excellent user experience during the Public Beta phase.
