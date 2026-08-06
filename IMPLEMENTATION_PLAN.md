# IMPLEMENTATION_PLAN.md — Brand Investment Program Implementation Plan

## Phase 1: Database Extensions & Schema Migrations
- Add `lifetime_investment_amount`, `investment_points`, `loyalty_points`, `investment_tier`, `tier_achieved_at`, `next_tier_progress`, `total_referrals`, `engagement_score`, `investment_level`, `total_orders`, `total_spent` to `users` table.
- Add `investment_points_earned`, `loyalty_points_earned`, `reward_multiplier`, `campaign_id` to `orders` table.
- Create models & migrations for `InvestmentTransactions`, `InvestmentTierHistory`, `RewardRedemptions`, `EngagementActivities`.
- Seed 6 brand investment tiers: Seed (0 IP), Bronze (3,000 IP), Silver (8,000 IP), Gold (15,000 IP), Platinum (30,000 IP), Diamond (60,000+ IP).

---

## Phase 2: Backend Core Services & API Routes
- Implement `investment.service.js` for dual point calculations (₹1 spent = 1 IP, ₹100 spent = 1 LP).
- Implement `reward.engine.js` for engagement activities (reviews +20 IP, referrals +300 IP, profile +50 IP, social +25 IP, campaigns 1.5x/2x).
- Update `order.controller.js` and `payment.controller.js` to process investment accrual inside Sequelize database transactions.
- Expose REST API endpoints:
  - `GET /api/loyalty/investment/summary`
  - `GET /api/loyalty/investment/history`
  - `POST /api/loyalty/investment/engage`
  - `POST /api/loyalty/investment/redeem`
  - `POST /api/loyalty/investment/calculate-order`

---

## Phase 3: Frontend User Investment Dashboard
- Transform `LoyaltyPage.jsx` into the **Brand Investment Dashboard**.
- Add Framer Motion animated components:
  - `InvestmentTierCard.jsx`: Metallic gradients, progress bars, tier badges.
  - `InvestmentTimeline.jsx`: Lifetime engagement timeline.
  - `RewardRedemptionModal.jsx`: LP redemption dialog.
- Update `DashboardTabs.jsx` navigation and badges.

---

## Phase 4: Product & Checkout Touchpoints
- Modify `ProductDetailPage.jsx`: Add "Invest with this purchase" badge, estimated IP/LP earnings, and projected tier progress.
- Modify `CheckoutPage.jsx`: Add real-time investment calculation summary and post-payment celebratory motion modal.

---

## Phase 5: Admin Panel & Management Dashboard
- Upgrade `LoyaltyManagement.jsx` into **Brand Investment Management Dashboard**.
- Features: Investment Analytics (LTV, Tier Distribution, Reward Cost, Redemption Rate), Manual Point Adjustments with Audit Logs, Dynamic Tier Threshold Configuration, Campaign & Rule Builder.

---

## Phase 6: Automated Testing & Verification
- Unit & integration tests for service logic, order calculations, and engagement bonuses.
- Security tests against double-award, point manipulation, and race conditions.
