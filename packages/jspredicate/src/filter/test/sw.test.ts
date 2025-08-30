import { describe, expect, it } from 'vitest';
import { createFilter } from '../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: sw operator', () => {
  it('firstName sw "Mi"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName sw "Mi"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  it('firstName sw "Michal"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName sw "Michal"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  it('should throw error when sw operator value is not a string', () => {
    const users = [{ firstName: 'Michal', lastName: 'Nieruchalski' }];
    expect(() => filterArray(users, 'firstName sw 123'))
      .toThrow('Value for \'sw\' operator has to be a string. \'123\' is not a string.');
  });

  it('should throw error when attribute value is not a string for sw operator', () => {
    const users = [{ firstName: 'Michal', age: 25 }];
    expect(() => filterArray(users, 'age sw "25"'))
      .toThrow('Attribute value for \'sw\' operator has to be a string. Non-string value encountered.');
  });

  it('should handle null and undefined attribute values for sw operator', () => {
    const users = [{ firstName: 'Michal' }, { firstName: null }, { firstName: undefined }]; 
    expect(filterArray(users, 'firstName sw "Mi"'))
      .toEqual([ { firstName: 'Michal' } ]);
  });
});