
export const formatCurrency = (val: number, symbol: string = 'Rs.') => `${symbol} ${val.toLocaleString()}`;

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
