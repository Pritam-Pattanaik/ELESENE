# FEATURE_GAP_ANALYSIS.md — Brand Investment System Gap Analysis

## Overview
This document compares ELESENE's legacy loyalty implementation with the required **Brand Investment Program** specification.

---

| Existing Feature | Missing Feature / Target Specification | Recommended Implementation | Complexity | Estimated Time |
| :--- | :--- | :--- | :--- | :--- |
| Single `loyalty_points` field in User model | Dual-currency model: **Investment Points (IP)** (lifetime, non-expiring, tier-determining) and **Loyalty Points (LP)** (spendable reward balance). | Extend `users` table with `lifetime_investment_amount`, `investment_points`, `loyalty_points`, `investment_tier`, `tier_achieved_at`, `next_tier_progress`, `total_referrals`, `engagement_score`, `investment_level`, `total_orders`, `total_spent`. | Medium | 4 Hours |
| Standard points on orders (1 pt per ₹100) | Dual earning formula: ₹1 spent = 1 IP; ₹100 spent = 1 LP. Campaign & engagement multipliers (1.5x festival, 2x anniversary). | Extend `orders` table with `investment_points_earned`, `loyalty_points_earned`, `reward_multiplier`, `campaign_id`. | Low | 3 Hours |
| Basic `loyalty_transactions` table | Dedicated ledger tables: `InvestmentTransactions`, `InvestmentTierHistory`, `RewardRedemptions`, `EngagementActivities`. | Create 4 new Sequelize models & migrations with indexed FKs and audit columns. | Medium | 5 Hours |
| Fixed 3-tier model (Member, Insider, Founder) | Configurable 6-tier hierarchy: **Seed (0 IP), Bronze (3k IP), Silver (8k IP), Gold (15k IP), Platinum (30k IP), Diamond (60k+ IP)**. | Seed dynamic tier thresholds into `loyalty_tiers` and update `evaluateTier()` logic. | Low | 2 Hours |
| Basic Loyalty Page (`LoyaltyPage.jsx`) | **Brand Investment Dashboard** with Lifetime Investment, Tier Card, Next Tier Progress, Timeline, Badges, Referral stats, Benefits, Redemption history. | Redesign `LoyaltyPage.jsx` into a modular suite with rich Framer Motion animations & tabs. | High | 8 Hours |
| No investment pre-calculation on Product detail | "Invest with this purchase" badge showing estimated IP/LP earnings, next tier progress, and unlocked perks. | Add `InvestmentImpactWidget` on `ProductDetailPage.jsx`. | Medium | 4 Hours |
| Standard Checkout summary | **Checkout Investment Summary** displaying IP/LP earned, tier progress, and post-payment Celebration Modal animation. | Extend `CheckoutPage.jsx` with real-time calculations and celebration overlay. | Medium | 5 Hours |
| Hardcoded order completion reward logic | **Configurable Reward & Rules Engine** for purchases, reviews (+20 IP), referrals (+300 IP), profile completion (+50 IP), social shares (+25 IP), double IP days. | Build `RewardEngine` service supporting active campaign rules, multipliers, and activity triggers. | High | 8 Hours |
| Standard admin loyalty list | **Brand Investment Management Dashboard** with analytics (LTV, Tier distribution, Reward cost, Redemption rate), Manual adjustments, Campaign builder, Audit logs, RBAC. | Upgrade `LoyaltyManagement.jsx` and `AdminDashboard.jsx` with chart visualizations and rule management. | High | 10 Hours |
| Simple notifications | Multi-channel notifications (in-app, push, email triggers) for tier upgrades, rewards, referrals, and campaign launches. | Create Notification triggers in `engagement.service.js` and extend `Notification` model. | Medium | 4 Hours |
