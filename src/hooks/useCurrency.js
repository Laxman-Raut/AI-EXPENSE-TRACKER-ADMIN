import { useSelector } from 'react-redux';

// Current exchange conversion rate: 1 USD = 85.0 INR
export const USD_TO_INR_RATE = 85.0;

export const useCurrency = () => {
  const currency = useSelector((state) => state.ui?.currency || 'INR');
  const symbol = currency === 'USD' ? '$' : '₹';

  /**
   * Converts value from sourceCurrency ('USD' or 'INR') to active Dashboard currency
   */
  const convertAmount = (val, sourceCurrency = 'USD') => {
    if (val === undefined || val === null || isNaN(val)) return 0;
    const num = Number(val);
    const src = (sourceCurrency === '$' || sourceCurrency === 'USD') ? 'USD' : 'INR';
    const tgt = currency; // 'INR' or 'USD'

    if (src === tgt) return num;
    if (src === 'USD' && tgt === 'INR') return Math.round(num * USD_TO_INR_RATE);
    if (src === 'INR' && tgt === 'USD') return Number((num / USD_TO_INR_RATE).toFixed(2));
    return num;
  };

  /**
   * Formats value with source currency conversion into localized Dashboard currency string
   */
  const formatAmount = (val, sourceCurrency = 'USD') => {
    if (val === undefined || val === null || isNaN(val)) return `${symbol}0`;
    const converted = convertAmount(val, sourceCurrency);
    return `${symbol}${converted.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
  };

  return {
    currency,
    symbol,
    rate: currency === 'INR' ? USD_TO_INR_RATE : 1,
    convertAmount,
    formatAmount,
  };
};

export default useCurrency;
