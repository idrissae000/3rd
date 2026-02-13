import clsx from 'clsx';

export function cn(...args: clsx.ClassValue[]) {
  return clsx(args);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
