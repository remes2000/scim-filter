import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: le operator', () => {
  describe('string (lexicographical)', () => {
    it('should return false when attribute value is greater than the filter value', () => {
      const users = [{ type: 'cherry' }];
      expect(filterArray(users, 'type le "banana"')).toEqual([]);
    });

    it('should return true when attribute value is less than the filter value', () => {
      const users = [{ type: 'apple' }];
      expect(filterArray(users, 'type le "banana"')).toEqual([{ type: 'apple' }]);
    });

    it('should return true when attribute value is equal to the filter value', () => {
      const users = [{ type: 'banana' }];
      expect(filterArray(users, 'type le "banana"')).toEqual([{ type: 'banana' }]);
    });

    it('should be case insensitive', () => {
      const users = [{ type: 'Cherry' }];
      expect(filterArray(users, 'type le "banana"')).toEqual([]);
    });

    it('should return false when attribute value is not a string', () => {
      const users = [{ type: 20 }];
      expect(filterArray(users, 'type le "25"')).toEqual([]);
    });
  });

  describe('integer (numeric)', () => {
    it('should return false when attribute value is greater than the filter value', () => {
      const users = [{ age: 30 }];
      expect(filterArray(users, 'age le 25')).toEqual([]);
    });

    it('should return true when attribute value is less than the filter value', () => {
      const users = [{ age: 20 }];
      expect(filterArray(users, 'age le 25')).toEqual([{ age: 20 }]);
    });

    it('should return true when attribute value is equal to the filter value', () => {
      const users = [{ age: 25 }];
      expect(filterArray(users, 'age le 25')).toEqual([{ age: 25 }]);
    });

    it('should return false when attribute value is not a number', () => {
      const users = [{ age: '20' }];
      expect(filterArray(users, 'age le 25')).toEqual([]);
    });
  });

  describe('datetime (stored as string)', () => {
    describe('when filter value is a valid date', () => {
      it('should return false when attribute value is greater than the filter value', () => {
        const users = [{ createdAt: '2025-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt le "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return true when attribute value is less than the filter value', () => {
        const users = [{ createdAt: '2020-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt le "2023-01-01T00:00:00Z"')).toEqual([{ createdAt: '2020-01-01T00:00:00Z' }]);
      });

      it('should return true when attribute value is equal to the filter value', () => {
        const users = [{ createdAt: '2023-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt le "2023-01-01T00:00:00Z"')).toEqual([{ createdAt: '2023-01-01T00:00:00Z' }]);
      });

      it('should return false when attribute value is an invalid date string', () => {
        const users = [{ createdAt: 'not-a-date' }];
        expect(filterArray(users, 'createdAt le "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is a number', () => {
        const users = [{ createdAt: 0 }];
        expect(filterArray(users, 'createdAt le "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is a boolean', () => {
        const users = [{ createdAt: false }];
        expect(filterArray(users, 'createdAt le "2023-01-01T00:00:00Z"')).toEqual([]);
      });
    });
  });

  describe('string that looks like a partial date (uses lexicographic order)', () => {
    // "2025" is a bare year and does not pass the full date prefix check (YYYY-MM-DD),
    // so it falls back to lexicographic comparison.
    it('should use lexicographic comparison for bare year "2025"', () => {
      const users = [{ code: '1026a' }, { code: '1027b' }];
      expect(filterArray(users, 'code le "2025"')).toEqual([{ code: '1026a' }, { code: '1027b' }]);
    });

    // "2025-10" is a year-month partial date and does not pass the full date prefix check (YYYY-MM-DD),
    // so it falls back to lexicographic comparison.
    it('should use lexicographic comparison for year-month "2025-10"', () => {
      const users = [{ code: '2024-01a' }, { code: '2024-01b' }];
      expect(filterArray(users, 'code le "2025-10"')).toEqual([{ code: '2024-01a' }, { code: '2024-01b' }]);
    });
  });

  describe('missing attribute value (always return false)', () => {
    it('should return false when attribute is not present on the object', () => {
      const users = [{ firstName: 'Michal' }];
      expect(filterArray(users, 'age le 25')).toEqual([]);
    });

    it('should return false when attribute value is null', () => {
      const users = [{ age: null }];
      expect(filterArray(users, 'age le 25')).toEqual([]);
    });

    it('should return false when attribute value is undefined', () => {
      const users = [{ age: undefined }];
      expect(filterArray(users, 'age le 25')).toEqual([]);
    });
  });

  describe('unsupported filter values (always return false)', () => {
    it('should return false when filter value is true', () => {
      const users = [{ active: true }];
      expect(filterArray(users, 'active le true')).toEqual([]);
    });

    it('should return false when filter value is false', () => {
      const users = [{ active: false }];
      expect(filterArray(users, 'active le false')).toEqual([]);
    });

    it('should return false when filter value is null', () => {
      const users = [{ age: 25 }];
      expect(filterArray(users, 'age le null')).toEqual([]);
    });
  });
});
