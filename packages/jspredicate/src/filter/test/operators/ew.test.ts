import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: ew operator', () => {
  it('firstName ew "al"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName ew "al"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  it('should return true for full match firstName ew "Michal"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName ew "Michal"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  it('ew should be case sensitive firstName ew "AL"', () => {
    const users = [{ firstName: 'Michal' },];
    expect(filterArray(users, 'firstName ew "AL"')).toEqual([]);
  });

  it('should throw error when ew operator value is not a string', () => {
    const users = [{ firstName: 'Michal', lastName: 'Nieruchalski' }];
    expect(() => filterArray(users, 'firstName ew 123'))
      .toThrow('Value for \'ew\' operator has to be a string. 123 is not a string.');
  });

  it('should return false when attribute is not present', () => {
    const users = [{}];
    expect(filterArray(users, 'age ew "25"')).toEqual([]);
  });

  it('should return false when attribute value is not a string', () => {
    const users = [{ age: 25 }, { age: null }, { age: undefined }];
    expect(filterArray(users, 'age ew "25"')).toEqual([]);
  });
});

