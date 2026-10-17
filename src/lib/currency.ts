/**
 * Global multi-currency formatting helper tailored to the active language
 */
export const getCurrencySymbol = (lng?: string): string => {
  const lang = (lng || 'pt').split('-')[0].toLowerCase();
  switch (lang) {
    case 'en':
      return '$';
    case 'es':
    case 'fr':
    case 'de':
    case 'it':
      return '€';
    case 'ja':
    case 'zh':
      return '¥';
    case 'ru':
      return '₽';
    case 'hi':
      return '₹';
    case 'ko':
      return '₩';
    case 'pt':
    default:
      return 'R$';
  }
};

export const getCurrencyCode = (lng?: string): string => {
  const lang = (lng || 'pt').split('-')[0].toLowerCase();
  switch (lang) {
    case 'en':
      return 'USD';
    case 'es':
    case 'fr':
    case 'de':
    case 'it':
      return 'EUR';
    case 'ja':
      return 'JPY';
    case 'zh':
      return 'CNY';
    case 'ru':
      return 'RUB';
    case 'hi':
      return 'INR';
    case 'ko':
      return 'KRW';
    case 'pt':
    default:
      return 'BRL';
  }
};

export const formatPrice = (amount: number, lng?: string): string => {
  const lang = (lng || 'pt').split('-')[0].toLowerCase();
  const symbol = getCurrencySymbol(lang);
  
  if (lang === 'ja' || lang === 'ko') {
    return `${symbol} ${Math.round(amount).toLocaleString()}`;
  }
  
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return `${symbol} ${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
