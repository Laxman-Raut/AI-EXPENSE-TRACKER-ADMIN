import { useSelector } from 'react-redux';

// Fallback rate used only if backend API is unreachable
const FALLBACK_USD_TO_INR = 85.0;

export const useCurrency = () => {
  const currency = useSelector((state) => state.ui?.currency || 'INR');
  const liveRate = useSelector((state) => state.ui?.exchangeRate || FALLBACK_USD_TO_INR);
  const ratesMap = useSelector((state) => state.ui?.ratesMap || null);
  const symbol = currency === 'USD' ? '$' : '₹';

  /**
   * Converts a numeric value from sourceCurrency to active Dashboard currency.
   * Uses live exchange rate from backend API (fetched on Dashboard boot).
   * Default sourceCurrency is 'INR' because backend stores revenue/payment amounts in INR.
   */
  const convertAmount = (val, sourceCurrency = 'INR') => {
    if (val === undefined || val === null || isNaN(val)) return 0;
    const num = Number(val);

    const normalize = (c) => {
      const s = String(c || '').toUpperCase().trim();
      if (s === '$' || s === 'USD') return 'USD';
      if (s === '₹' || s === 'INR') return 'INR';
      return s;
    };

    const src = normalize(sourceCurrency);
    const tgt = normalize(currency);

    if (src === tgt) return num;

    // If we have a full rates map from backend, use it for precision
    if (ratesMap && ratesMap[src] && ratesMap[tgt]) {
      const fromRate = Number(ratesMap[src]);
      const toRate = Number(ratesMap[tgt]);
      if (fromRate > 0 && toRate > 0) {
        const converted = (num / fromRate) * toRate;
        return Number(converted.toFixed(2));
      }
    }

    // Fallback to simple USD<->INR conversion using liveRate
    if (src === 'USD' && tgt === 'INR') return Number((num * liveRate).toFixed(2));
    if (src === 'INR' && tgt === 'USD') return Number((num / liveRate).toFixed(2));
    return num;
  };

  /**
   * Formats value with currency conversion into localized Dashboard currency string.
   * Default sourceCurrency is 'INR' because backend stores amounts in INR.
   */
  const formatAmount = (val, sourceCurrency = 'INR') => {
    if (val === undefined || val === null || isNaN(val)) return `${symbol}0`;
    const converted = convertAmount(val, sourceCurrency);
    return `${symbol}${converted.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
  };

  return {
    currency,
    symbol,
    rate: liveRate,
    convertAmount,
    formatAmount,
  };
};

export default useCurrency;

