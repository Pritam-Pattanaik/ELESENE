/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — REWARD & CAMPAIGN RULE ENGINE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Configurable rule engine for Brand Investment multipliers, active campaigns,
 * anniversary events, double investment days, and engagement rules.
 */

// Active Campaign Registry (In-memory + DB configurable)
const ACTIVE_CAMPAIGNS = [
  {
    id: 'festival-2026',
    name: 'Festival Celebration Campaign',
    multiplier: 1.5,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    description: '1.5x Investment Points on all festival purchases',
  },
  {
    id: 'anniversary-2026',
    name: 'Brand Anniversary Campaign',
    multiplier: 2.0,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    description: '2x Investment Points on brand anniversary purchases',
  },
];

/**
 * Determine current applicable reward multiplier for an order
 */
const getActiveMultiplier = (cartTotal, user = null, campaignId = null) => {
  let multiplier = 1.0;
  let activeCampaign = null;

  const nowStr = new Date().toISOString().substring(0, 10);

  if (campaignId) {
    activeCampaign = ACTIVE_CAMPAIGNS.find(c => c.id === campaignId);
  } else {
    activeCampaign = ACTIVE_CAMPAIGNS.find(c => nowStr >= c.startDate && nowStr <= c.endDate);
  }

  if (activeCampaign) {
    multiplier = activeCampaign.multiplier;
  }

  // Tier-based multiplier boost
  if (user && user.investmentTier) {
    if (user.investmentTier === 'Gold') multiplier += 0.1;
    if (user.investmentTier === 'Platinum') multiplier += 0.25;
    if (user.investmentTier === 'Diamond') multiplier += 0.5;
  }

  return {
    multiplier: Number(multiplier.toFixed(2)),
    activeCampaign: activeCampaign || null,
  };
};

/**
 * Pre-calculate Investment Points and Loyalty Points earned for a projected order total
 */
const calculateOrderInvestment = (cartSubtotal, user = null, campaignId = null) => {
  const subtotalNum = Number(cartSubtotal) || 0;
  const { multiplier, activeCampaign } = getActiveMultiplier(subtotalNum, user, campaignId);

  const estimatedIp = Math.floor(subtotalNum * multiplier);
  const estimatedLp = Math.floor((subtotalNum / 100) * multiplier);

  return {
    cartSubtotal: subtotalNum,
    multiplier,
    activeCampaign,
    estimatedIp,
    estimatedLp,
  };
};

module.exports = {
  ACTIVE_CAMPAIGNS,
  getActiveMultiplier,
  calculateOrderInvestment,
};
