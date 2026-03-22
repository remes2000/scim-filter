import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe.skip('Filter: co operator', () => {
  it('name co "chal"', () => {
    const users = [{ name: 'Michal' }, { name: 'MichalABC' }, { name: 'MichalBCA' }];
    expect(filterArray(users, 'name co "chal"'))
      .toEqual([{ name: 'Michal' }, { name: 'MichalABC' }, { name: 'MichalBCA' }]);
  });

  it('should return true for full match firstName co "Michal"', () => {
    const users = [{ firstName: 'Michal' }];
    expect(filterArray(users, 'firstName co "Michal"'))
      .toEqual([ { firstName: 'Michal' } ]);
  });

  it('co should be case sensitive firstName co "mi"', () => {
    const users = [{ firstName: 'MICHAL' },];
    expect(filterArray(users, 'firstName co "mi"')).toEqual([]);
  });

  it('should throw error when co operator value is not a string', () => {
    const users = [{ firstName: 'Michal', lastName: 'Nieruchalski' }];
    expect(() => filterArray(users, 'firstName co 123'))
      .toThrow('Value for \'co\' operator has to be a string. 123 is not a string.');
  });

  it('should return false when attribute is not present', () => {
    const users = [{}];
    expect(filterArray(users, 'age co "25"')).toEqual([]);
  });

  it('should return false when attribute value is not a string', () => {
    const users = [{ age: 25 }, { age: null }, { age: undefined }];
    expect(filterArray(users, 'age co "25"')).toEqual([]);
  });
});
