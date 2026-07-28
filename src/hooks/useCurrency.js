import { useSelector } from 'react-redux';

// Current exchange conversion rate: 1 USD = 85.0 INR
export const USD_TO_INR_RATE = 85.0;

export const useCurrency = () => {
  const currency = useSelector((state) => state.ui?.currency || 'INR');
  const symbol = currency === 'USD' ? '$' : '₹';

  // Converts base USD values into selected currency (INR or USD)
  const convertAmount = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 0;
    const num = Number(val);
    if (currency === 'INR') {
      return Math.round(num * USD_TO_INR_RATE);
    }
    return num;
  };

  // Formats raw USD base values into localized currency string (e.g. $19 or ₹1,615)
  const formatAmount = (val) => {
    if (val === undefined || val === null || isNaN(val)) return `${symbol}0`;
    const converted = convertAmount(val);
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
