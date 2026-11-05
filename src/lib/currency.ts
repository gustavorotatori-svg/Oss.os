/**
 * Multi-currency and price formatting utility for OSS.OS BJJ Portal.
 */

export function getCurrencyCode(lang?: string): string {
  if (!lang) return 'BRL';
  const clean = lang.toLowerCase();
  if (clean.startsWith('en')) return 'USD';
  if (clean.startsWith('es')) return 'EUR';
  return 'BRL';
}

export function getCurrencySymbol(lang?: string): string {
  if (!lang) return 'R$';
  const clean = lang.toLowerCase();
  if (clean.startsWith('en')) return '$';
  if (clean.startsWith('es')) return '€';
  return 'R$';
}

export function formatPrice(amount: number | string | undefined | null, lang?: string): string {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  const currency = getCurrencyCode(lang);
  const locale = lang?.startsWith('en') ? 'en-US' : lang?.startsWith('es') ? 'es-ES' : 'pt-BR';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    const symbol = getCurrencySymbol(lang);
    return `${symbol} ${num.toFixed(2)}`;
  }
}
