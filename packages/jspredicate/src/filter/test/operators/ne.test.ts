import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe.skip('Filter: ne operator', () => {
  it('firstName ne "Michal"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName ne "Michal"'))
      .toEqual([ { firstName: 'Jan', lastName: 'Kowalski' } ]);
  });

  // These tests assume that not all of the objects are identical,
  // Therefore if a property is missing we handle it instead of throwing an error.
  it('should always return true if property does not exist', () => {
    const users = [{ firstName: 'Michal' }];
    expect(filterArray(users, 'lastName ne null')).toEqual([{ firstName: 'Michal' }]);
  });

  it('should always return true when undefined ne null', () => {
    const users = [{ firstName: 'Michal', lastName: undefined }];
    expect(filterArray(users, 'lastName ne null')).toEqual([{ firstName: 'Michal' }]);
  });

  it('should always return true when undefined ne null', () => {
    const users = [{ firstName: 'Michal', lastName: undefined }];
    expect(filterArray(users, 'lastName ne null')).toEqual([{ firstName: 'Michal' }]);
  });
});
