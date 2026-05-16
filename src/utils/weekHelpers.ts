import { startOfWeek, addWeeks, subWeeks, format, addDays } from 'date-fns';
import { DAYS_OF_WEEK, type DayOfWeek } from '../db/models';

/**
 * Get the Monday of the week containing the given date.
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Get the ISO date string (YYYY-MM-DD) for a Monday.
 */
export function getWeekStartISO(date: Date = new Date()): string {
  return format(getWeekStart(date), 'yyyy-MM-dd');
}

/**
 * Navigate to next week's Monday.
 */
export function nextWeek(currentMonday: Date): Date {
  return addWeeks(currentMonday, 1);
}

/**
 * Navigate to previous week's Monday.
 */
export function prevWeek(currentMonday: Date): Date {
  return subWeeks(currentMonday, 1);
}

/**
 * Format a Monday date for display: "Week of May 19, 2026"
 */
export function formatWeekLabel(monday: Date): string {
  return `Week of ${format(monday, 'MMMM d, yyyy')}`;
}

/**
 * Get the date for a specific day in the week starting at the given Monday.
 */
export function getDayDate(monday: Date, day: DayOfWeek): Date {
  const dayIndex = DAYS_OF_WEEK.indexOf(day);
  return addDays(monday, dayIndex);
}

/**
 * Format a day's date: "Mon 19"
 */
export function formatDayShort(monday: Date, day: DayOfWeek): string {
  const date = getDayDate(monday, day);
  return format(date, 'EEE d');
}
