import { format, parseISO, isValid } from "date-fns";

/**
 * Safely parses any date representation without unintended timezone day-shifts.
 * Handles ISO strings, Date objects, and 'YYYY-MM-DD' date-only formats.
 */
export function parseAppDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null;

  const str = String(dateInput).trim();
  if (!str) return null;

  // Date-only string like YYYY-MM-DD (treat as local calendar date)
  const dateOnlyMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return isValid(dt) ? dt : null;
  }

  // ISO string or other parseable formats
  try {
    const parsed = parseISO(str);
    if (isValid(parsed)) return parsed;
  } catch {
    /* fallback */
  }

  const fallback = new Date(str);
  return isValid(fallback) ? fallback : null;
}

/**
 * Extracts hour and minute numbers from strings like "14:30", "09:00", "2:30 PM", "9:00 AM".
 */
function parseTimeComponents(timeStr?: string | null): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  let raw = String(timeStr).trim();
  if (!raw) return null;

  // Handle ranges like "09:00 - 10:30", "1:30 PM - 2:30 PM", "1:30pm - 2:30pm", "1:30-2:30"
  if (raw.includes(" - ") || raw.includes(" – ") || raw.includes(" — ")) {
    raw = raw.split(/ – | - | — /)[0].trim();
  } else if (/^\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*[-–]/i.test(raw)) {
    const parts = raw.split(/[-–]/);
    if (parts.length >= 2 && parts[0].trim()) {
      raw = parts[0].trim();
    }
  }

  // 12-hour format with AM/PM e.g. "02:30 PM", "9:15 am", "12:00PM", "1:30pm"
  const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const period = ampmMatch[3].toLowerCase();

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return { hours, minutes };
  }

  // 24-hour format e.g. "14:30", "09:00", "14:30:00", "9:30"
  const match24 = raw.match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes };
    }
  }

  return null;
}

/**
 * Formats hours (0-23) and minutes (0-59) into strict 12-hour AM/PM string, e.g. "9:00 AM", "2:30 PM".
 */
function format12Hour(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const mStr = String(minutes).padStart(2, "0");
  return `${h12}:${mStr} ${period}`;
}

/**
 * Normalizes any time representation to strict 12-hour AM/PM format (e.g. "2:30 PM", "9:00 AM").
 * If timeStr is absent, checks dateInput: only extracts time if date has an explicit non-midnight time.
 */
export function formatAppTime(
  timeStr?: string | null,
  dateInput?: string | Date | null
): string | null {
  if (timeStr) {
    const trimmed = String(timeStr).trim();

    // Check for range like "09:00 - 10:30" or "1:00 PM - 2:30 PM"
    if (trimmed.includes(" - ") || trimmed.includes(" – ")) {
      const separator = trimmed.includes(" – ") ? " – " : " - ";
      const parts = trimmed.split(separator);
      if (parts.length === 2) {
        const start = formatAppTime(parts[0]);
        const end = formatAppTime(parts[1]);
        if (start && end) return `${start} – ${end}`;
      }
    }

    const comp = parseTimeComponents(trimmed);
    if (comp) {
      return format12Hour(comp.hours, comp.minutes);
    }
    // Return trimmed if it already contains AM/PM
    if (/am|pm/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }
    return trimmed;
  }

  // If no explicit timeStr, check dateInput
  if (dateInput) {
    const parsed = parseAppDate(dateInput);
    if (!parsed) return null;

    // Guard: ignore UTC midnight or exact 00:00:00 when stored as date-only
    if (typeof dateInput === "string") {
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateInput);
      const isUtcMidnight = /T00:00:00(\.000)?(Z|\+00:00)?$/.test(dateInput);
      if (isDateOnly || isUtcMidnight) {
        return null;
      }
    }

    return format(parsed, "h:mm a");
  }

  return null;
}

/**
 * Converts any time string into 24-hour "HH:mm" format for HTML <input type="time"> controls.
 */
export function to24HourTime(timeStr?: string | null): string {
  if (!timeStr) return "09:00";
  const comp = parseTimeComponents(timeStr);
  if (!comp) return "09:00";
  const h = String(comp.hours).padStart(2, "0");
  const m = String(comp.minutes).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Combines a base date and optional time string into a single local Date object.
 * Used for accurate countdowns and chronological sorting.
 */
export function combineDateAndTime(
  dateInput?: string | Date | null,
  timeStr?: string | null
): Date {
  const base = parseAppDate(dateInput) || new Date();
  const res = new Date(base);

  if (timeStr) {
    const comp = parseTimeComponents(timeStr);
    if (comp) {
      res.setHours(comp.hours, comp.minutes, 0, 0);
      return res;
    }
  }

  return res;
}

/**
 * Formats a date safely without throwing or timezone drifting.
 */
export function formatAppDate(
  dateInput?: string | Date | null,
  pattern = "EEEE, MMM d"
): string {
  const parsed = parseAppDate(dateInput);
  if (!parsed) return "";
  return format(parsed, pattern);
}

