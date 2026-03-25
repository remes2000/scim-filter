import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: lt operator', () => {
  describe('string (lexicographical)', () => {
    it('should return false when attribute value is greater than the filter value', () => {
      const users = [{ type: 'cherry' }];
      expect(filterArray(users, 'type lt "banana"')).toEqual([]);
    });

    it('should return true when attribute value is less than the filter value', () => {
      const users = [{ type: 'apple' }];
      expect(filterArray(users, 'type lt "banana"')).toEqual([{ type: 'apple' }]);
    });

    it('should return false when attribute value is equal to the filter value', () => {
      const users = [{ type: 'banana' }];
      expect(filterArray(users, 'type lt "banana"')).toEqual([]);
    });

    it('should be case insensitive', () => {
      const users = [{ type: 'Cherry' }];
      expect(filterArray(users, 'type lt "banana"')).toEqual([]);
    });

    it('should return false when attribute value is not a string', () => {
      const users = [{ type: 20 }];
      expect(filterArray(users, 'type lt "25"')).toEqual([]);
    });
  });

  describe('integer (numeric)', () => {
    it('should return false when attribute value is greater than the filter value', () => {
      const users = [{ age: 30 }];
      expect(filterArray(users, 'age lt 25')).toEqual([]);
    });

    it('should return true when attribute value is less than the filter value', () => {
      const users = [{ age: 20 }];
      expect(filterArray(users, 'age lt 25')).toEqual([{ age: 20 }]);
    });

    it('should return false when attribute value is equal to the filter value', () => {
      const users = [{ age: 25 }];
      expect(filterArray(users, 'age lt 25')).toEqual([]);
    });

    it('should return false when attribute value is not a number', () => {
      const users = [{ age: '20' }];
      expect(filterArray(users, 'age lt 25')).toEqual([]);
    });
  });

  describe('datetime (stored as string)', () => {
    describe('when filter value is a valid date', () => {
      it('should return false when attribute value is greater than the filter value', () => {
        const users = [{ createdAt: '2025-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt lt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return true when attribute value is less than the filter value', () => {
        const users = [{ createdAt: '2020-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt lt "2023-01-01T00:00:00Z"')).toEqual([{ createdAt: '2020-01-01T00:00:00Z' }]);
      });

      it('should return false when attribute value is equal to the filter value', () => {
        const users = [{ createdAt: '2023-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt lt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is an invalid date string', () => {
        const users = [{ createdAt: 'not-a-date' }];
        expect(filterArray(users, 'createdAt lt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is a number', () => {
        const users = [{ createdAt: 0 }];
        expect(filterArray(users, 'createdAt lt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is a boolean', () => {
        const users = [{ createdAt: false }];
        expect(filterArray(users, 'createdAt lt "2023-01-01T00:00:00Z"')).toEqual([]);
      });
    });
  });

  // TODO: here I stopped validating, here I should resume my work
  describe('string that looks like a partial date (uses lexicographic order)', () => {
    it('should use lexicographic comparison for bare year "2025"', () => {
      const users = [{ code: '2024z' }, { code: '2025' }];
      expect(filterArray(users, 'code lt "2025"')).toEqual([{ code: '2024z' }]);
    });

    it('should use lexicographic comparison for year-month "2025-01"', () => {
      const users = [{ code: '2025-00z' }, { code: '2025-01' }];
      expect(filterArray(users, 'code lt "2025-01"')).toEqual([{ code: '2025-00z' }]);
    });
  });

  describe('missing attribute value (always return false)', () => {
    it('should return false when attribute is not present on the object', () => {
      const users = [{ firstName: 'Michal' }];
      expect(filterArray(users, 'age lt 25')).toEqual([]);
    });

    it('should return false when attribute value is null', () => {
      const users = [{ age: null }];
      expect(filterArray(users, 'age lt 25')).toEqual([]);
    });

    it('should return false when attribute value is undefined', () => {
      const users = [{ age: undefined }];
      expect(filterArray(users, 'age lt 25')).toEqual([]);
    });
  });

  describe('unsupported filter values (always return false)', () => {
    it('should return false when filter value is true', () => {
      const users = [{ active: true }];
      expect(filterArray(users, 'active lt true')).toEqual([]);
    });

    it('should return false when filter value is false', () => {
      const users = [{ active: false }];
      expect(filterArray(users, 'active lt false')).toEqual([]);
    });

    it('should return false when filter value is null', () => {
      const users = [{ age: 25 }];
      expect(filterArray(users, 'age lt null')).toEqual([]);
    });
  });
});
