/**
 * Converts a sqlite time string (YYYY-MM-DD HH:MM:SS) to a Date
 * https://www.sqlite.org/lang_datefunc.html
 * @param timeString sqlite time string
 */
export function toDate(timeString: string): Date {
  return new Date(timeString.replace(" ", "T") + "Z");
}

/**
 * Compare Dates
 * @param a Date
 * @param b Date
 */
export function compareDate(a: Date, b: Date): number {
  if (a < b) return -1;
  else if (a > b) return 1;
  else return 0;
}
