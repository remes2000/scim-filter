import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe.skip('Filter: sw operator', () => {
  it('firstName sw "Mi"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName sw "Mi"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  it('should return true for full match firstName sw "Michal"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName sw "Michal"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  it('sw should be case sensitive firstName sw "mi"', () => {
    const users = [{ firstName: 'Michal' },];
    expect(filterArray(users, 'firstName sw "mi"')).toEqual([]);
  });

  it('should throw error when sw operator value is not a string', () => {
    const users = [{ firstName: 'Michal', lastName: 'Nieruchalski' }];
    expect(() => filterArray(users, 'firstName sw 123'))
      .toThrow('Value for \'sw\' operator has to be a string. 123 is not a string.');
  });

  it('should return false when attribute is not present', () => {
    const users = [{}];
    expect(filterArray(users, 'age sw "25"')).toEqual([]);
  });

  it('should return false when attribute value is not a string', () => {
    const users = [{ age: 25 }, { age: null }, { age: undefined }];
    expect(filterArray(users, 'age sw "25"')).toEqual([]);
  });
});
