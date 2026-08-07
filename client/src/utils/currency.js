/**
 * Safe currency formatter for Indian Rupees (₹).
 * Guarantees that ₹NaN is never rendered.
 * If value is missing, invalid, or NaN, logs an error with context and returns fallback.
 *
 * @param {number|string|null|undefined} amount - Amount to format
 * @param {object|string} [options] - Options object or fallback string
 * @param {string} [options.fallback='₹0'] - Fallback formatted string
 * @param {boolean} [options.showSymbol=true] - Whether to prefix with ₹
 * @param {string} [options.context=''] - Diagnostic label for logging errors
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const opts = typeof options === 'string' ? { fallback: options } : options;
  const {
    fallback = '₹0',
    showSymbol = true,
    context = ''
  } = opts;

  if (amount === undefined || amount === null || amount === '') {
    console.error(`[Currency Formatting Error] ${context ? `(${context}) ` : ''}Value is ${amount}. Returning fallback: '${fallback}'`);
    return fallback;
  }

  const numericValue = Number(amount);

  if (isNaN(numericValue) || !isFinite(numericValue)) {
    console.error(`[Currency Formatting Error] ${context ? `(${context}) ` : ''}Invalid numeric value: '${amount}' (evaluated to NaN/Infinity). Returning fallback: '${fallback}'`);
    return fallback;
  }

  const formatted = numericValue.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  return showSymbol ? `₹${formatted}` : formatted;
};

export default formatCurrency;
