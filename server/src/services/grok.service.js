/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — GROK AI SERVICE (Server-side only)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Wraps Grok API calls with:
 *  - Rate limiting (10 req/min per userId — in-memory token bucket)
 *  - Response caching (10-min LRU, keyed by prompt hash)
 *  - Retry with exponential backoff on 429/5xx
 *
 * CRITICAL: GROK_API_KEY is loaded from process.env on the server ONLY.
 * It is never sent to or accessible from the client.
 *
 * If GROK_API_KEY is not set, all calls return a clear stub message so the
 * feature degrades gracefully without crashing.
 */

const crypto = require('crypto');

// ─── Config ──────────────────────────────────────────────────────────────────
const GROK_API_KEY  = process.env.GROK_API_KEY;
const GROK_BASE_URL = 'https://api.x.ai/v1'; // xAI / Grok endpoint
const GROK_MODEL    = process.env.GROK_MODEL || 'grok-beta';
const MAX_TOKENS    = 512;
const RATE_LIMIT    = 10;       // requests per window
const RATE_WINDOW   = 60_000;   // 1 minute in ms
const CACHE_TTL     = 600_000;  // 10 minutes in ms

// ─── In-memory rate-limit store ───────────────────────────────────────────────
// Map<userId, { count: number, windowStart: number }>
const rateLimitStore = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const entry = rateLimitStore.get(userId) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_WINDOW) {
    // New window
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  rateLimitStore.set(userId, entry);
  return true;
};

// ─── In-memory LRU cache ─────────────────────────────────────────────────────
// Simple Map-based cache with TTL; fine for low-volume admin AI calls
const responseCache = new Map();

const hashPrompt = (systemPrompt, userMessage) =>
  crypto.createHash('sha256').update(systemPrompt + '||' + userMessage).digest('hex').slice(0, 16);

const cacheGet = (key) => {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }
  return entry.value;
};

const cacheSet = (key, value) => {
  // Evict oldest if cache exceeds 100 entries
  if (responseCache.size >= 100) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  responseCache.set(key, { value, ts: Date.now() });
};

// ─── Core API call with retry ─────────────────────────────────────────────────
const callGrok = async (systemPrompt, userMessage, retries = 2) => {
  if (!GROK_API_KEY) {
    return '[Grok AI unavailable — GROK_API_KEY not configured on server]';
  }

  const cacheKey = hashPrompt(systemPrompt, userMessage);
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const body = {
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: MAX_TOKENS,
    temperature: 0.4,
  };

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });

      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          attempt++;
          continue;
        }
        const text = await res.text();
        throw new Error(`Grok API error ${res.status}: ${text}`);
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Grok API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      const result = data?.choices?.[0]?.message?.content || '[No response from Grok]';

      cacheSet(cacheKey, result);
      return result;
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      attempt++;
    }
  }
};

// ─── Named prompts ────────────────────────────────────────────────────────────

/**
 * Admin: summarize loyalty program performance.
 * @param {object} stats — from loyaltyService.getProgramStats()
 */
const getLoyaltySummary = async (stats) => {
  const system = `You are a data analyst for ELESENE, a luxury Indian fashion brand.
Provide a concise, bullet-pointed summary of the loyalty program's performance.
Flag any anomalies or trends that warrant admin attention.
Keep it factual, 150 words max.`;

  const user = `Loyalty program stats:
- Total points issued: ${stats.totalPointsIssued}
- Total points reversed (returns): ${stats.totalPointsReversed}
- Net outstanding points: ${stats.netPointsOutstanding}
- Flagged accounts: ${stats.flaggedAccounts}
- Tier distribution: ${JSON.stringify(stats.tierDistribution)}`;

  return callGrok(system, user);
};

/**
 * Admin: triage a flagged/high-return account.
 * AI suggests — admin decides. Output is advisory only.
 *
 * @param {object} user   — { full_name, email, loyalty_tier, loyalty_points }
 * @param {object} stat   — LoyaltyReturnStat row
 * @param {Array}  txns   — recent LoyaltyTransaction rows
 */
const triageFlaggedAccount = async (user, stat, txns = []) => {
  const system = `You are a customer experience analyst for ELESENE luxury fashion.
You are helping an admin understand if a flagged customer account shows signs of:
(a) Genuine fit/quality issues (size returns, defective items) — low concern
(b) Potential return abuse (changed_mind, pattern returns, high frequency)

Be balanced and fair. Customers returning for fit issues should NOT be penalised.
Suggest a specific admin action (none / soft / medium / hard restriction), explain why,
and note if more data is needed. Be concise: 200 words max. Never auto-restrict — just advise.`;

  const user_msg = `Customer: ${user.full_name}
Tier: ${user.loyalty_tier} | Balance: ${user.loyalty_points} pts
Total orders: ${stat.total_orders} | Total returns: ${stat.total_returns}
Weighted returns: ${stat.weighted_returns} | Return rate: ${stat.return_rate}%
Current restriction: ${stat.restriction_level}
Flag reason: ${stat.flag_reason || 'rate threshold exceeded'}

Recent transactions (last 5): ${JSON.stringify(txns.slice(0, 5), null, 2)}`;

  return callGrok(system, user_msg);
};

/**
 * User-facing: answer a loyalty-related question in natural language.
 *
 * @param {string} userId   — for rate limiting
 * @param {object} loyalty  — { balance, currentTier, nextTier, pointsToNext, perks }
 * @param {string} query    — user's free-text question
 */
const getUserAssistant = async (userId, loyalty, query) => {
  if (!checkRateLimit(userId)) {
    return 'You\'ve sent too many questions recently. Please wait a minute and try again.';
  }

  const system = `You are the ELESENE loyalty assistant. Be warm, friendly, and concise.
Answer only loyalty-related questions (points, tiers, perks, how to earn more).
Never discuss unrelated topics. Never invent perks not listed below.
Respond in 2-3 sentences max.

Customer loyalty snapshot:
- Points balance: ${loyalty.balance}
- Current tier: ${loyalty.currentTier}
- Next tier: ${loyalty.nextTier || 'Already at top tier'}
- Points to next tier: ${loyalty.pointsToNext || 0}
- Current perks: ${JSON.stringify(loyalty.perks || {})}`;

  return callGrok(system, query);
};

module.exports = {
  getLoyaltySummary,
  triageFlaggedAccount,
  getUserAssistant,
  // Expose for testing only
  _callGrok: callGrok,
};
