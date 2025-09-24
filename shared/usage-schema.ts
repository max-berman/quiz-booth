import { pgTable, varchar, text, integer, timestamp, jsonb, boolean, decimal } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Plans & Subscriptions (Placeholder for future payment integration)
export const userPlans = pgTable("user_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // References Firebase auth users
  planType: varchar("plan_type", { enum: ["free", "premium", "enterprise"] }).notNull().default("free"),
  // TODO: Payment Integration - Add Stripe subscription fields later
  // stripeSubscriptionId: varchar("stripe_subscription_id"),
  // status: varchar("status", { enum: ["active", "canceled", "past_due"] }).default("active"),
  // billingCycleStart: timestamp("billing_cycle_start"),
  // billingCycleEnd: timestamp("billing_cycle_end"),
  status: varchar("status", { enum: ["active", "beta"] }).notNull().default("beta"), // Beta phase status
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Usage Events (Immutable Audit Trail)
export const usageEvents = pgTable("usage_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventType: varchar("event_type", {
    enum: [
      "game_created",
      "question_generated",
      "ai_question_generated",
      "player_submission",
      "analytics_viewed",
      "export_used",
      "custom_theme_applied"
    ]
  }).notNull(),
  resourceId: varchar("resource_id"), // game_id, question_id, etc.
  metadata: jsonb("metadata"), // Additional context
  costUnits: decimal("cost_units", { precision: 10, scale: 4 }).default("0.0000"), // For future billing
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Real-time Usage Counters (For Fast Queries)
export const usageCounters = pgTable("usage_counters", {
  userId: varchar("user_id").primaryKey(),
  // Current billing period usage (reset monthly)
  currentPeriodGamesCreated: integer("current_period_games_created").default(0),
  currentPeriodQuestionsGenerated: integer("current_period_questions_generated").default(0),
  currentPeriodAiQuestions: integer("current_period_ai_questions").default(0),
  currentPeriodPlayerSubmissions: integer("current_period_player_submissions").default(0),
  currentPeriodAnalyticsViews: integer("current_period_analytics_views").default(0),
  currentPeriodExports: integer("current_period_exports").default(0),
  currentPeriodCustomThemes: integer("current_period_custom_themes").default(0),
  lastResetDate: timestamp("last_reset_date").defaultNow(), // When counters were last reset
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Feature Usage Limits (Configurable per plan)
export const featureLimits = pgTable("feature_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planType: varchar("plan_type", { enum: ["free", "premium", "enterprise"] }).notNull(),
  featureType: varchar("feature_type").notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  // TODO: Payment Integration - Add overage rates later
  // overageRate: decimal("overage_rate", { precision: 10, scale: 4 }),
  includedInPlan: boolean("included_in_plan").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas for validation
export const insertUserPlanSchema = createInsertSchema(userPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageEventSchema = createInsertSchema(usageEvents).omit({
  id: true,
  recordedAt: true,
});

export const insertUsageCounterSchema = createInsertSchema(usageCounters).omit({
  updatedAt: true,
});

export const insertFeatureLimitSchema = createInsertSchema(featureLimits).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type UserPlan = typeof userPlans.$inferSelect;
export type InsertUserPlan = z.infer<typeof insertUserPlanSchema>;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type InsertUsageEvent = z.infer<typeof insertUsageEventSchema>;
export type UsageCounter = typeof usageCounters.$inferSelect;
export type InsertUsageCounter = z.infer<typeof insertUsageCounterSchema>;
export type FeatureLimit = typeof featureLimits.$inferSelect;
export type InsertFeatureLimit = z.infer<typeof insertFeatureLimitSchema>;

// Public Beta Limits Configuration
export const PUBLIC_BETA_LIMITS = {
  FREE: {
    games_created: 10, // 10 games per month
    questions_per_game: 15, // 15 questions per game
    analytics_views: 100, // 100 analytics views per month
    exports: 10, // 10 exports per month
  }
} as const;
