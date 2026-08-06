# DATABASE_CHANGES.md — Database Extensions & Migrations

## Overview
All database modifications strictly extend existing tables without dropping or destroying existing data.

---

## 1. Schema Extensions (Existing Tables)

### `users` Table Extensions
- `lifetime_investment_amount`: `DECIMAL(12, 2)`, DEFAULT `0.00`
- `investment_points`: `INTEGER`, DEFAULT `0`
- `loyalty_points`: `INTEGER`, DEFAULT `0`
- `investment_tier`: `VARCHAR(50)`, DEFAULT `'Seed'`
- `tier_achieved_at`: `TIMESTAMP WITH TIME ZONE`
- `next_tier_progress`: `INTEGER`, DEFAULT `0`
- `total_referrals`: `INTEGER`, DEFAULT `0`
- `engagement_score`: `INTEGER`, DEFAULT `0`
- `investment_level`: `INTEGER`, DEFAULT `1`
- `total_orders`: `INTEGER`, DEFAULT `0`
- `total_spent`: `DECIMAL(12, 2)`, DEFAULT `0.00`

### `orders` Table Extensions
- `investment_points_earned`: `INTEGER`, DEFAULT `0`
- `loyalty_points_earned`: `INTEGER`, DEFAULT `0`
- `reward_multiplier`: `DECIMAL(3, 2)`, DEFAULT `1.00`
- `campaign_id`: `UUID`, NULLABLE

---

## 2. New Table Definitions

### `investment_transactions`
Ledger recording every Investment Point (IP) and Loyalty Point (LP) movement.
- `id`: `UUID` (PK)
- `user_id`: `UUID` (FK -> users.id)
- `order_id`: `UUID` (FK -> orders.id, NULLABLE)
- `source`: `VARCHAR(50)` (e.g. `'purchase'`, `'review'`, `'referral'`, `'profile_completion'`, `'social_share'`, `'admin_adjustment'`)
- `amount`: `DECIMAL(10, 2)`
- `investment_points`: `INTEGER`
- `loyalty_points`: `INTEGER`
- `multiplier`: `DECIMAL(3, 2)`, DEFAULT `1.00`
- `description`: `TEXT`
- `created_at`: `TIMESTAMP WITH TIME ZONE`

### `investment_tier_history`
History log of tier promotions and downgrades.
- `id`: `UUID` (PK)
- `user_id`: `UUID` (FK -> users.id)
- `previous_tier`: `VARCHAR(50)`
- `new_tier`: `VARCHAR(50)`
- `investment_points_at_change`: `INTEGER`
- `reason`: `TEXT`
- `created_at`: `TIMESTAMP WITH TIME ZONE`

### `reward_redemptions`
Tracked redemptions of Loyalty Points for rewards or discounts.
- `id`: `UUID` (PK)
- `user_id`: `UUID` (FK -> users.id)
- `reward_title`: `VARCHAR(100)`
- `reward_type`: `VARCHAR(50)` (`'coupon'`, `'free_shipping'`, `'product'`, `'exclusive_access'`)
- `loyalty_points_spent`: `INTEGER`
- `coupon_code_generated`: `VARCHAR(50)`
- `status`: `VARCHAR(30)` (`'active'`, `'used'`, `'expired'`)
- `expires_at`: `TIMESTAMP WITH TIME ZONE`
- `created_at`: `TIMESTAMP WITH TIME ZONE`

### `engagement_activities`
Audited record of user engagement tasks.
- `id`: `UUID` (PK)
- `user_id`: `UUID` (FK -> users.id)
- `activity_type`: `VARCHAR(50)` (`'review'`, `'referral'`, `'profile_completion'`, `'social_share'`)
- `reference_id`: `VARCHAR(100)`
- `ip_awarded`: `INTEGER`
- `lp_awarded`: `INTEGER`
- `created_at`: `TIMESTAMP WITH TIME ZONE`

---

## 3. Migration Execution Order
1. `20260806000006-extend-users-and-orders-for-investment.js`
2. `20260806000007-create-investment-transactions.js`
3. `20260806000008-create-investment-tier-history.js`
4. `20260806000009-create-reward-redemptions.js`
5. `20260806000010-create-engagement-activities.js`
6. `20260806000011-seed-brand-investment-tiers.js`
