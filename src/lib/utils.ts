import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'PEN') {
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency || 'PEN',
    }).format(amount || 0);
  } catch (error) {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}

export function getContrastingTextColor(hexColor: string) {
  // Safe default
  if (!hexColor) return 'white';

  // Remove hash if present
  const hex = hexColor.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 2), 16);
  const b = parseInt(hex.substring(4, 2), 16);

  // Calculate brightness (YIQ formula)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Return black for bright colors, white for dark colors
  return yiq >= 128 ? '#000000' : '#ffffff';
}
