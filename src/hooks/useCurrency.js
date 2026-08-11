import { useSelector } from 'react-redux';

// Fallback rate used only if backend API is unreachable
const FALLBACK_USD_TO_INR = 85.0;

export const useCurrency = () => {
  const currency = 'INR';
  const symbol = '₹';

  const convertAmount = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 0;
    return Number(val);
  };

  const formatAmount = (val) => {
    if (val === undefined || val === null || isNaN(val)) return `${symbol}0`;
    const num = Number(val);
    return `${symbol}${num.toLocaleString('en-IN')}`;
  };

  return {
    currency,
    symbol,
    rate: 1,
    convertAmount,
    formatAmount,
  };
};

export default useCurrency;

