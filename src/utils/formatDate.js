const DEFAULT_LOCALE = "en-IN";

/**
 * Convert a date input into a valid Date object.
 */
function toValidDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format a date for display.
 * Example: 17 Oct 2026
 */
export function formatDate(value, locale = DEFAULT_LOCALE) {
  const date = toValidDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format date and time together.
 */
export function formatDateTime(value, locale = DEFAULT_LOCALE) {
  const date = toValidDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format only the time.
 */
export function formatTime(value, locale = DEFAULT_LOCALE) {
  const date = toValidDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Show relative time such as "5 minutes ago".
 */
export function formatRelativeTime(
  value,
  locale = DEFAULT_LOCALE,
) {
  const date = toValidDate(value);

  if (!date) return "";

  const differenceSeconds = Math.round(
    (date.getTime() - Date.now()) / 1000,
  );

  const absoluteSeconds = Math.abs(differenceSeconds);

  const units = [
    { name: "year", seconds: 31_536_000 },
    { name: "month", seconds: 2_592_000 },
    { name: "week", seconds: 604_800 },
    { name: "day", seconds: 86_400 },
    { name: "hour", seconds: 3_600 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 },
  ];

  const unit =
    units.find((item) => absoluteSeconds >= item.seconds) ||
    units[units.length - 1];

  const amount =
    Math.round(differenceSeconds / unit.seconds);

  return new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  }).format(amount, unit.name);
}