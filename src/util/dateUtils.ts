/**
 * Converts a sqlite time string (YYYY-MM-DD HH:MM:SS) to a Date
 * https://www.sqlite.org/lang_datefunc.html
 * @param timeString sqlite time string
 */
function toDate(timeString: string): Date {
  return new Date(timeString.replace(" ", "T") + "Z");
}

/**
 * Compare two sqlite time strings (YYYY-MM-DD HH:MM:SS)
 * @param a sqlite time string
 * @param b sqlite time string
 */
export function compareTimeString(a: string, b: string): number {
  const aTime = toDate(a).getTime();
  const bTime = toDate(b).getTime();
  if (aTime < bTime) return -1;
  else if (aTime === bTime) return 0;
  else return 1;
}
