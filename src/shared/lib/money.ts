export const parseAmount = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const normalized = trimmed.replace(/[,₦\s]|NGN/gi, '');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  return null;
};

export const formatNaira = (value: unknown): string => {
  const amount = parseAmount(value);
  if (amount === null) return 'N/A';
  if (amount === 0) return 'Free';

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₦${amount.toFixed(2)}`;
  }
};

