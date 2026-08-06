/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — BRAND INVESTMENT SERVICE UNIT TESTS
 * ══════════════════════════════════════════════════════════════════════════════
 */

const { evaluateInvestmentTier, getInvestmentTierProgress } = require('../services/investment.service');
const { calculateOrderInvestment, getActiveMultiplier } = require('../services/reward.engine');

describe('Brand Investment Formula & Tier Tests', () => {
  test('Evaluate 6 Tier Boundaries', async () => {
    expect(await evaluateInvestmentTier(0)).toBe('Seed');
    expect(await evaluateInvestmentTier(2999)).toBe('Seed');
    expect(await evaluateInvestmentTier(3000)).toBe('Bronze');
    expect(await evaluateInvestmentTier(7999)).toBe('Bronze');
    expect(await evaluateInvestmentTier(8000)).toBe('Silver');
    expect(await evaluateInvestmentTier(14999)).toBe('Silver');
    expect(await evaluateInvestmentTier(15000)).toBe('Gold');
    expect(await evaluateInvestmentTier(29999)).toBe('Gold');
    expect(await evaluateInvestmentTier(30000)).toBe('Platinum');
    expect(await evaluateInvestmentTier(59999)).toBe('Platinum');
    expect(await evaluateInvestmentTier(60000)).toBe('Diamond');
    expect(await evaluateInvestmentTier(150000)).toBe('Diamond');
  });

  test('Calculate Order Investment Points (₹1 = 1 IP, ₹100 = 1 LP)', () => {
    const result = calculateOrderInvestment(5400);
    expect(result.estimatedIp).toBe(5400);
    expect(result.estimatedLp).toBe(54);
  });

  test('Calculate Multipliers for Active Campaigns', () => {
    const festivalResult = calculateOrderInvestment(5400, null, 'festival-2026');
    expect(festivalResult.multiplier).toBe(1.5);
    expect(festivalResult.estimatedIp).toBe(8100);
    expect(festivalResult.estimatedLp).toBe(81);
  });

  test('Calculate Next Tier Progress Percentage', async () => {
    const progress = await getInvestmentTierProgress(1500); // Between 0 and 3000
    expect(progress.currentTier).toBe('Seed');
    expect(progress.nextTier).toBe('Bronze');
    expect(progress.progressPct).toBe(50);
    expect(progress.pointsToNext).toBe(1500);
  });
});
