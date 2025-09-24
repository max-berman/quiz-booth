import type { Express } from "express";
import { verifyFirebaseToken, type AuthenticatedRequest } from "../firebase-auth";
import { usageTracker } from "../lib/usage-tracker";
import { logger } from "../lib/logger";

export function registerUsageRoutes(app: Express) {
  // Get user's current usage summary
  app.get("/api/user/usage", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const usageSummary = await usageTracker.getUserUsageSummary(req.user.uid);
      res.json(usageSummary);
    } catch (error) {
      logger.error('Error getting user usage summary:', error);
      res.status(500).json({ message: "Failed to get usage summary" });
    }
  });

  // Check if user can perform a specific action (for UI to show warnings)
  app.get("/api/user/usage/check/:feature", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { feature } = req.params;
      const result = await usageTracker.checkBetaLimit(req.user.uid, feature);
      res.json(result);
    } catch (error) {
      logger.error('Error checking usage limit:', error);
      res.status(500).json({ message: "Failed to check usage limit" });
    }
  });

  // Initialize user plan (called when user signs up)
  app.post("/api/user/usage/initialize", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      await usageTracker.initializeUserPlan(req.user.uid);
      res.json({ message: "User plan initialized successfully" });
    } catch (error) {
      logger.error('Error initializing user plan:', error);
      res.status(500).json({ message: "Failed to initialize user plan" });
    }
  });

  // TODO: Payment Integration - Add billing-related endpoints later
  // - POST /api/user/billing/portal (get billing portal URL)
  // - POST /api/user/billing/subscribe (create subscription)
  // - POST /api/user/billing/cancel (cancel subscription)
  // - GET /api/user/billing/invoices (get billing history)
}
