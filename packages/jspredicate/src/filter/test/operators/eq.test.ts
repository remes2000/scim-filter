import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: eq operator', () => {
  it('firstName eq "Michal"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName eq "Michal"'))
      .toEqual([ { firstName: 'Michal', lastName: 'Nieruchalski' } ]);
  });

  // These tests assume that not all of the objects are identical,
  // Therefore if a property is missing we handle it instead of throwing an error.
  it('should always return false if property does not exist', () => {
    const users = [{ firstName: 'Michal' }];
    expect(filterArray(users, 'lastName eq null')).toEqual([]);
  });

  it('should return false when undefined eq null', () => {
    const users = [{ firstName: 'Michal', lastName: undefined }];
    expect(filterArray(users, 'lastName eq null')).toEqual([]);    
  });

  it('should return true when null eq null', () => {
    const users = [{ firstName: 'Michal', lastName: null }];
    expect(filterArray(users, 'lastName eq null'))
      .toEqual([{ firstName: 'Michal', lastName: null }]);
  });
});
