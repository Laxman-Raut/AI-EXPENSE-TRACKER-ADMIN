import { useSelector } from 'react-redux';

export const useCurrency = () => {
  const currency = useSelector((state) => state.ui?.currency || 'INR');
  const symbol = currency === 'USD' ? '$' : '₹';

  const formatAmount = (val) => {
    if (val === undefined || val === null || isNaN(val)) return `${symbol}0`;
    const num = Number(val);
    return `${symbol}${num.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
  };

  return {
    currency,
    symbol,
    formatAmount,
  };
};

export default useCurrency;
