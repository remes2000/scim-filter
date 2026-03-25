import { describe, expect, it } from 'vitest';
import { isValidDateString, isValidFullDateString } from '../date.js';

describe('isValidDateString', () => {
  describe('date-only formats', () => {
    it('accepts YYYY', () => {
      expect(isValidDateString('2023')).toBe(true);
    });

    it('accepts YYYY-MM', () => {
      expect(isValidDateString('2023-06')).toBe(true);
    });

    it('accepts YYYY-MM-DD', () => {
      expect(isValidDateString('2023-06-15')).toBe(true);
    });

    it('rejects invalid month 00', () => {
      expect(isValidDateString('2023-00')).toBe(false);
    });

    it('rejects invalid month 13', () => {
      expect(isValidDateString('2023-13')).toBe(false);
    });

    it('rejects invalid day 00', () => {
      expect(isValidDateString('2023-06-00')).toBe(false);
    });

    it('rejects invalid day 32', () => {
      expect(isValidDateString('2023-06-32')).toBe(false);
    });

    it('rejects day 31 in a 30-day month', () => {
      expect(isValidDateString('2023-04-31')).toBe(false);
    });

    it('rejects day 30 in February', () => {
      expect(isValidDateString('2023-02-30')).toBe(false);
    });

    it('rejects day 29 in February in a non-leap year', () => {
      expect(isValidDateString('2023-02-29')).toBe(false);
    });

    it('accepts day 29 in February in a leap year', () => {
      expect(isValidDateString('2024-02-29')).toBe(true);
    });

    // Leap year 
    it('accepts 4 AD as a leap year', () => {
      expect(isValidDateString('0004-02-29')).toBe(true);
    });

    it('rejects 1 AD as a leap year', () => {
      expect(isValidDateString('0001-02-29')).toBe(false);
    });

    it('accepts 1 BC as a leap year', () => {
      expect(isValidDateString('+000000-02-29')).toBe(true);
      expect(isValidDateString('0000-02-29')).toBe(true);
    });

    it('rejects 301 BC as a leap year', () => {
      expect(isValidDateString('-000300-02-29')).toBe(false);
    });

    it('accepts 401 BC as a leap year', () => {
      expect(isValidDateString('-000400-02-29')).toBe(true);
    });
  
    it('rejects 3-digit year', () => {
      expect(isValidDateString('202')).toBe(false);
    });

    it('rejects 5-digit year without sign', () => {
      expect(isValidDateString('20231')).toBe(false);
    });

    it('rejects 6-digit year without sign', () => {
      expect(isValidDateString('202301')).toBe(false);
    });

    it('rejects +4-digit year (sign requires 6 digits)', () => {
      expect(isValidDateString('+2023')).toBe(false);
    });

    it('rejects -4-digit year (sign requires 6 digits)', () => {
      expect(isValidDateString('-2023')).toBe(false);
    });

    it('rejects +5-digit year', () => {
      expect(isValidDateString('+20231')).toBe(false);
    });
  });

  describe('datetime formats', () => {
    it('accepts YYYY-MM-DDTHH:mm', () => {
      expect(isValidDateString('2023-06-15T10:30')).toBe(true);
    });

    it('accepts YYYY-MM-DDTHH:mm:ss', () => {
      expect(isValidDateString('2023-06-15T10:30:45')).toBe(true);
    });

    it('accepts YYYY-MM-DDTHH:mm:ss.sss', () => {
      expect(isValidDateString('2023-06-15T10:30:45.123')).toBe(true);
    });

    it('accepts datetime with Z timezone', () => {
      expect(isValidDateString('2023-06-15T10:30:45Z')).toBe(true);
    });

    it('accepts datetime with positive offset', () => {
      expect(isValidDateString('2023-06-15T10:30:45+02:00')).toBe(true);
    });

    it('accepts datetime with negative offset', () => {
      expect(isValidDateString('2023-06-15T10:30:45-05:30')).toBe(true);
    });

    it('rejects invalid hour 25', () => {
      expect(isValidDateString('2023-06-15T25:00')).toBe(false);
    });

    it('rejects invalid minute 60', () => {
      expect(isValidDateString('2023-06-15T10:60')).toBe(false);
    });

    it('rejects invalid second 60', () => {
      expect(isValidDateString('2023-06-15T10:30:60')).toBe(false);
    });
  });

  describe('hour 24 edge cases', () => {
    it('accepts 24:00 (midnight next day)', () => {
      expect(isValidDateString('2023-06-15T24:00')).toBe(true);
    });

    it('accepts 24:00:00', () => {
      expect(isValidDateString('2023-06-15T24:00:00')).toBe(true);
    });

    it('accepts 24:00:00.000', () => {
      expect(isValidDateString('2023-06-15T24:00:00.000')).toBe(true);
    });

    it('rejects 24:01 (hour 24 only valid with :00)', () => {
      expect(isValidDateString('2023-06-15T24:01')).toBe(false);
    });

    it('rejects 24:00:01', () => {
      expect(isValidDateString('2023-06-15T24:00:01')).toBe(false);
    });
  });

  describe('expanded year format', () => {
    it('accepts positive expanded year (+006-digit)', () => {
      expect(isValidDateString('+100000-01-01T00:00')).toBe(true);
    });

    it('accepts negative expanded year', () => {
      expect(isValidDateString('-100000-01-01T00:00')).toBe(true);
    });

    it('rejects -000000 (invalid expanded year)', () => {
      expect(isValidDateString('-000000-01-01T00:00')).toBe(false);
    });
  });

  describe('timezone offset validation', () => {
    it('rejects timezone hour 24', () => {
      expect(isValidDateString('2023-06-15T10:30+24:00')).toBe(false);
    });

    it('rejects timezone minute 60', () => {
      expect(isValidDateString('2023-06-15T10:30+02:60')).toBe(false);
    });

    it('accepts max valid timezone +23:59', () => {
      expect(isValidDateString('2023-06-15T10:30+23:59')).toBe(true);
    });
  });

  describe('date-time with partial date (YYYY or YYYY-MM before T)', () => {
    it('accepts YYYY T HH:mm', () => {
      expect(isValidDateString('2024T12:00')).toBe(true);
    });

    it('accepts YYYY T HH:mm with Z', () => {
      expect(isValidDateString('2024T12:00Z')).toBe(true);
    });

    it('accepts YYYY-MM T HH:mm', () => {
      expect(isValidDateString('2024-01T12:00')).toBe(true);
    });

    it('accepts YYYY-MM T HH:mm:ss', () => {
      expect(isValidDateString('2024-01T12:00:00')).toBe(true);
    });

    it('accepts YYYY-MM T HH:mm:ss.sss with Z', () => {
      expect(isValidDateString('2024-01T12:00:00.000Z')).toBe(true);
    });
  });

  describe('invalid input', () => {
    it('rejects empty string', () => {
      expect(isValidDateString('')).toBe(false);
    });

    it('rejects plain text', () => {
      expect(isValidDateString('not-a-date')).toBe(false);
    });

    it('rejects date missing T separator', () => {
      expect(isValidDateString('2023-06-15 10:30:00')).toBe(false);
    });

    it('rejects partial time without minutes', () => {
      expect(isValidDateString('2023-06-15T10')).toBe(false);
    });
  });
});

describe('isValidFullDateString', () => {
  describe('accepts full dates (YYYY-MM-DD)', () => {
    it('accepts YYYY-MM-DD', () => {
      expect(isValidFullDateString('2023-06-15')).toBe(true);
    });

    it('accepts YYYY-MM-DD with time', () => {
      expect(isValidFullDateString('2023-06-15T10:30')).toBe(true);
    });

    it('accepts YYYY-MM-DD with full datetime', () => {
      expect(isValidFullDateString('2023-06-15T10:30:45.123Z')).toBe(true);
    });

    it('accepts expanded year with full date', () => {
      expect(isValidFullDateString('+100000-01-01')).toBe(true);
    });

    it('accepts negative expanded year with full date', () => {
      expect(isValidFullDateString('-100000-01-01')).toBe(true);
    });

    it('accepts leap day', () => {
      expect(isValidFullDateString('2024-02-29')).toBe(true);
    });
  });

  describe('rejects partial dates', () => {
    it('rejects YYYY only', () => {
      expect(isValidFullDateString('2023')).toBe(false);
    });

    it('rejects YYYY-MM only', () => {
      expect(isValidFullDateString('2023-06')).toBe(false);
    });

    it('rejects YYYY with time', () => {
      expect(isValidFullDateString('2024T12:00')).toBe(false);
    });

    it('rejects YYYY-MM with time', () => {
      expect(isValidFullDateString('2024-01T12:00')).toBe(false);
    });
  });
});
