import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';

export const DATE_FORMAT = 'yyyy-MM-dd HH:mm';

export const formatToKST = (timestamp: number | undefined | null): string => {
  if (!timestamp) return '';
  try {
    // UTC 시간에 9시간(32400000 밀리초)을 더해 KST로 변환
    const kstTimestamp = timestamp + 9 * 60 * 60 * 1000;
    const date = new Date(kstTimestamp);
    return format(date, DATE_FORMAT, { locale: ko });
  } catch {
    return '';
  }
};

export const toUTCMillis = (date: Date | null): number | undefined => {
  if (!date) return undefined;
  // KST 시간에서 9시간을 빼서 UTC로 변환
  return date.getTime() - 9 * 60 * 60 * 1000;
};

export const fromUTCMillis = (timestamp: number | undefined | null): Date | null => {
  if (!timestamp) return null;
  // UTC 시간에 9시간을 더해 KST로 변환
  return new Date(timestamp + 9 * 60 * 60 * 1000);
};

export const isOverdue = (dueDate: number | undefined): boolean => {
  if (!dueDate) return false;
  const now = Math.floor(Date.now() / 1000);
  return dueDate < now;
};

export const toStartOfDay = (date: Date): number => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return Math.floor(newDate.getTime() / 1000);
};

export const formatDate = (timestamp: number): string => {
  if (!timestamp) return '-';
  
  // Convert seconds to milliseconds if needed
  const milliseconds = timestamp > 100000000000 ? timestamp : timestamp * 1000;
  const date = new Date(milliseconds);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
