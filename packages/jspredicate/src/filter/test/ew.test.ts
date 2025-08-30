import { describe, expect, it } from 'vitest';
import { createFilter } from '../filter.js';

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

  it('firstName ew "Michal"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName ew "Michal"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  it('should throw error when ew operator value is not a string', () => {
    const users = [{ firstName: 'Michal', lastName: 'Nieruchalski' }];
    expect(() => filterArray(users, 'firstName ew 123'))
      .toThrow('Value for \'ew\' operator has to be a string. \'123\' is not a string.');
  });

  it('should throw error when attribute value is not a string for ew operator', () => {
    const users = [{ firstName: 'Michal', age: 25 }];
    expect(() => filterArray(users, 'age ew "25"'))
      .toThrow('Attribute value for \'ew\' operator has to be a string. Non-string value encountered.');
  });

  it('should handle null and undefined attribute values for ew operator', () => {
    const users = [{ firstName: 'Michal' }, { firstName: null }, { firstName: undefined }]; 
    expect(filterArray(users, 'firstName ew "al"'))
      .toEqual([ { firstName: 'Michal' } ]);
  });
});