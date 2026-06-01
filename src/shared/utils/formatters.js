export const formatPrice = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (value) => {
  if (!value) return 'Не указана';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};
