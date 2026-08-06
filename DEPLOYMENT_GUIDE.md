# DEPLOYMENT_GUIDE.md — Production Deployment & Rollout Strategy

## 1. Migration Deployment Sequence
1. Backup production database before applying migrations.
2. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```
3. Run tier seeding script:
   ```bash
   node server/src/scripts/seed-investment-tiers.js
   ```

## 2. Environment Variables Verification
Ensure server `.env` contains:
```env
INVESTMENT_IP_PER_INR=1
INVESTMENT_LP_PER_100_INR=1
DEFAULT_CAMPAIGN_MULTIPLIER=1.0
LOYALTY_EXPIRY_DAYS=365
```

## 3. Zero-Downtime Rollout Steps
1. Deploy server API updates.
2. Verify `/api/loyalty/investment/summary` endpoint returns 200 OK.
3. Deploy frontend Vite bundle (`npm run build`).
4. Perform smoke test on checkout flow and user investment dashboard.
