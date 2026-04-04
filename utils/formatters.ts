
export const formatCurrency = (val: number, symbol: string = 'Rs.') => `${symbol} ${val.toLocaleString()}`;

export const formatDate = (dateString: string | Date | undefined | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
