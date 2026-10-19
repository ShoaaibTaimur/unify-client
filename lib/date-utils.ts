import { format, parseISO, isValid } from "date-fns";

export function parseAppDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null;

  const str = String(dateInput).trim();
  if (!str) return null;

  const dateOnlyMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return isValid(dt) ? dt : null;
  }

  try {
    const parsed = parseISO(str);
    if (isValid(parsed)) return parsed;
  } catch {
    /* fallback */
  }

  const fallback = new Date(str);
  return isValid(fallback) ? fallback : null;
}

function parseTimeComponents(timeStr?: string | null): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  let raw = String(timeStr).trim();
  if (!raw) return null;

  if (raw.includes(" - ") || raw.includes(" – ") || raw.includes(" — ")) {
    raw = raw.split(/ – | - | — /)[0].trim();
  } else if (/^\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*[-–]/i.test(raw)) {
    const parts = raw.split(/[-–]/);
    if (parts.length >= 2 && parts[0].trim()) {
      raw = parts[0].trim();
    }
  }

  const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const period = ampmMatch[3].toLowerCase();

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return { hours, minutes };
  }

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

function format12Hour(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const mStr = String(minutes).padStart(2, "0");
  return `${h12}:${mStr} ${period}`;
}

export function formatAppTime(
  timeStr?: string | null,
  dateInput?: string | Date | null
): string | null {
  if (timeStr) {
    const trimmed = String(timeStr).trim();

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
    if (/am|pm/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }
    return trimmed;
  }

  if (dateInput) {
    const parsed = parseAppDate(dateInput);
    if (!parsed) return null;

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

export function to24HourTime(timeStr?: string | null): string {
  if (!timeStr) return "09:00";
  const comp = parseTimeComponents(timeStr);
  if (!comp) return "09:00";
  const h = String(comp.hours).padStart(2, "0");
  const m = String(comp.minutes).padStart(2, "0");
  return `${h}:${m}`;
}

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

export function formatAppDate(
  dateInput?: string | Date | null,
  pattern = "EEEE, MMM d"
): string {
  const parsed = parseAppDate(dateInput);
  if (!parsed) return "";
  return format(parsed, pattern);
}

