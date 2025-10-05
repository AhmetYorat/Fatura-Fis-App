import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'dd MMMM yyyy', { locale: tr });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}