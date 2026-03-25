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

const YEAR_RE = new RegExp(`^${YEAR}$`);
const YEAR_MONTH_RE = new RegExp(`^${YEAR}-${MONTH}$`);
const DATE_RE = new RegExp(`^${YEAR}-${MONTH}-${DAY}$`);

const DATE_TIME_HOUR_MINUTE = new RegExp(`^${YEAR}-${MONTH}-${DAY}T${HOUR}:${MINUTE}${TZ}?$`);
const DATE_TIME_HOUR_MINUTE_SECONDS = new RegExp(`^${YEAR}-${MONTH}-${DAY}T${HOUR}:${MINUTE}:${SECOND}${TZ}?$`);
const DATE_TIME_HOUR_MINUTE_SECONDS_MS = new RegExp(`^${YEAR}-${MONTH}-${DAY}T${HOUR}:${MINUTE}:${SECOND}\\.${MS}${TZ}?$`);

const REGS = [ YEAR_RE, YEAR_MONTH_RE, DATE_RE, DATE_TIME_HOUR_MINUTE, DATE_TIME_HOUR_MINUTE_SECONDS, DATE_TIME_HOUR_MINUTE_SECONDS_MS ];

function execFirst(date: string): RegExpExecArray | null {
  for (const reg of REGS) {
    const m = reg.exec(date);
    if (m !== null) return m;
  }
  return null;
}

export function isValidDateString(date: string): boolean {
  const match = execFirst(date);
  if (match === null) return false;

  const { year, month, day, hour, minute, second, ms, tz } = match.groups!;

  if (year === '-000000') {
    return false;
  }
  if (month && ( parseInt(month) < 1 || parseInt(month) > 12 ))  {
    return false; 
  }
  if (day) {
    const maxDay = daysInMonth(parseInt(year), parseInt(month)); 
    if (parseInt(day) < 1 || parseInt(day) > maxDay) {
      return false;
    }
  }
  if (hour && parseInt(hour) > 24) {
    return false;
  }
  if (minute && parseInt(minute) > 59) {
    return false;
  }
  if (second && parseInt(second) > 59) {
    return false;
  }
  if (ms && parseInt(ms) > 999) {
    return false;
  }

  // 24 is only valid as 24:00[:00[.000]]
  if (hour && parseInt(hour) === 24) {
   if (parseInt(minute) !== 0 || parseInt(second ?? '0') !== 0 || parseInt(ms ?? '000') !== 0)  {
    return false;
   }
  }

  if (tz && tz !== 'Z') {
    const [tzHour, tzMinute] = tz.slice(1).split(':');
    if (parseInt(tzHour) > 23 || parseInt(tzMinute) > 59) {
      return false;
    }
  }

  return true;
}

function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month - 1];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
