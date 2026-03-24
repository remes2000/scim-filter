// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
// https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format

// ECMAScript Date Time String Format (ISO 8601 extended):
//
// DateTimeString : Date | Date T Time TZ?
// Date           : YYYY | YYYY-MM | YYYY-MM-DD
// Time           : HH:mm | HH:mm:ss | HH:mm:ss.sss
// TZ             : Z | ±HH:mm
// YYYY           : 4-digit year (0000–9999) or ±6-digit expanded year (-000000 invalid)
// MM             : 01–12
// DD             : 01–31
// HH             : 00–23 (24 allowed only as 24:00[:00[.000]], meaning midnight next day)
// mm / ss        : 00–59
// sss            : 000–999

const YEAR   = '(?<year>[0-9]{4}|[+-][0-9]{6})';
const MONTH  = '(?<month>[0-9]{2})';
const DAY    = '(?<day>[0-9]{2})';

const HOUR   = '(?<hour>[0-9]{2})';
const MINUTE = '(?<minute>[0-9]{2})';
const SECOND = '(?<second>[0-9]{2})';
const MS     = '(?<ms>[0-9]{3})';
const TZ     = '(?<tz>Z|[+-][0-9]{2}:[0-9]{2})';

const DATE_PART = `${YEAR}(?:-${MONTH}(?:-${DAY})?)?`;
const TIME_PART = `${HOUR}:${MINUTE}(?::${SECOND}(?:\\.${MS})?)?`;

const DATE_ONLY_RE = new RegExp(`^${DATE_PART}$`);
const DATE_TIME_RE = new RegExp(`^${DATE_PART}T${TIME_PART}${TZ}?$`);

export function isValidDateString(date: string): boolean {
  const m = DATE_TIME_RE.exec(date) ?? DATE_ONLY_RE.exec(date);
  if (!m) return false;

  const { year, month, day, hour, minute, second, tz } = m.groups!;

  if (year === '-000000') return false;
  if (month  && (n(month)  < 1  || n(month)  > 12)) return false;
  if (day    && (n(day)    < 1  || n(day)    > 31)) return false;
  if (hour   && (n(hour)   > 24)) return false;
  if (minute && (n(minute) > 59)) return false;
  if (second && (n(second) > 59)) return false;

  // 24 is only valid as 24:00[:00[.000]]
  if (hour && n(hour) === 24 && (n(minute) !== 0 || n(second ?? '0') !== 0)) return false;

  // Calendar validation: check days per month (including leap years)
  if (month && day) {
    if (n(day) > daysInMonth(n(year), n(month))) return false;
  }

  if (tz && tz !== 'Z') {
    const [tzHour, tzMinute] = tz.slice(1).split(':');
    if (n(tzHour) > 23 || n(tzMinute) > 59) return false;
  }

  return true;
}

function daysInMonth(year: number, month: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function n(s: string): number {
  return parseInt(s, 10);
}
