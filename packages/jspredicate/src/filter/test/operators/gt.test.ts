import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: gt operator', () => {
  describe('string (lexicographical)', () => {
    it('should return false when attribute value is less than the filter value', () => {
      const users = [{ type: 'apple' }];
      expect(filterArray(users, 'type gt "banana"')).toEqual([]);
    });

    it('should return true when attribute value is greater than the filter value', () => {
      const users = [{ type: 'cherry' }];
      expect(filterArray(users, 'type gt "banana"')).toEqual([{ type: 'cherry' }]);
    });

    it('should return false when attribute value is equal to the filter value', () => {
      const users = [{ type: 'banana' }];
      expect(filterArray(users, 'type gt "banana"')).toEqual([]);
    });

    it('should be case insensitive', () => {
      const users = [{ type: 'Cherry' }];
      expect(filterArray(users, 'type gt "banana"')).toEqual([{ type: 'Cherry' }]);
    });

    it('should return false when attribute value is not a string', () => {
      const users = [{ type: 30 }];
      expect(filterArray(users, 'type gt "25"')).toEqual([]);
    });
  });

  describe('integer (numeric)', () => {
    it('should return false when attribute value is less than the filter value', () => {
      const users = [{ age: 20 }];
      expect(filterArray(users, 'age gt 25')).toEqual([]);
    });

    it('should return true when attribute value is greater than the filter value', () => {
      const users = [{ age: 30 }];
      expect(filterArray(users, 'age gt 25')).toEqual([{ age: 30 }]);
    });

    it('should return false when attribute value is equal to the filter value', () => {
      const users = [{ age: 25 }];
      expect(filterArray(users, 'age gt 25')).toEqual([]);
    });

    it('should return false when attribute value is not a number', () => {
      const users = [{ age: '30' }];
      expect(filterArray(users, 'age gt 25')).toEqual([]);
    });
  });

  // TODO: handle datetime
  describe.skip('datetime (stored as string)', () => {
    describe('when filter value is a valid date', () => {
      it('should return false when attribute value is less than the filter value', () => {
        const users = [{ createdAt: '2020-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt gt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return true when attribute value is greater than the filter value', () => {
        const users = [{ createdAt: '2025-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt gt "2023-01-01T00:00:00Z"')).toEqual([{ createdAt: '2025-01-01T00:00:00Z' }]);
      });

      it('should return false when attribute value is equal to the filter value', () => {
        const users = [{ createdAt: '2023-01-01T00:00:00Z' }];
        expect(filterArray(users, 'createdAt gt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is an invalid date string', () => {
        const users = [{ createdAt: 'not-a-date' }];
        expect(filterArray(users, 'createdAt gt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is a number', () => {
        const users = [{ createdAt: 9999999999999 }];
        expect(filterArray(users, 'createdAt gt "2023-01-01T00:00:00Z"')).toEqual([]);
      });

      it('should return false when attribute value is a boolean', () => {
        const users = [{ createdAt: true }];
        expect(filterArray(users, 'createdAt gt "2023-01-01T00:00:00Z"')).toEqual([]);
      });
    });
  });

  describe('missing attribute value (always return false)', () => {
    it('should return false when attribute is not present on the object', () => {
      const users = [{ firstName: 'Michal' }];
      expect(filterArray(users, 'age gt 25')).toEqual([]);
    });

    it('should return false when attribute value is null', () => {
      const users = [{ age: null }];
      expect(filterArray(users, 'age gt 25')).toEqual([]);
    });

    it('should return false when attribute value is undefined', () => {
      const users = [{ age: undefined }];
      expect(filterArray(users, 'age gt 25')).toEqual([]);
    });
  });

  describe('unsupported filter values (always return false)', () => {
    it('should return false when filter value is true', () => {
      const users = [{ active: true }];
      expect(filterArray(users, 'active gt true')).toEqual([]);
    });

    it('should return false when filter value is false', () => {
      const users = [{ active: false }];
      expect(filterArray(users, 'active gt false')).toEqual([]);
    });

    it('should return false when filter value is null', () => {
      const users = [{ age: 25 }];
      expect(filterArray(users, 'age gt null')).toEqual([]);
    });
  });
});
