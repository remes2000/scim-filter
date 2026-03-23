import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: ne operator', () => {
  it('firstName ne "Michal"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Jan', lastName: 'Kowalski' }
    ];
    expect(filterArray(users, 'firstName ne "Michal"'))
      .toEqual([ { firstName: 'Jan', lastName: 'Kowalski' } ]);
  });

  it('should return false if property does not exist', () => {
    const users = [{ firstName: 'Michal' }];
    expect(filterArray(users, 'lastName ne "Goliat"')).toEqual([]);
  });

  it('should return true when undefined ne null', () => {
    const users = [{ firstName: 'Michal', lastName: undefined }];
    expect(filterArray(users, 'lastName ne null')).toEqual([{ firstName: 'Michal', lastName: undefined }]);
  });

  it('should return false when null ne null', () => {
    const users = [{ firstName: 'Michal', lastName: null }];
    expect(filterArray(users, 'lastName ne null')).toEqual([]);
  });

  it('age ne 25', () => {
    const users = [{ age: 25 }, { age: 30 }];
    expect(filterArray(users, 'age ne 25')).toEqual([{ age: 30 }]);
  });

  it('active ne true', () => {
    const users = [{ active: true }, { active: false }];
    expect(filterArray(users, 'active ne true')).toEqual([{ active: false }]);
  });
});
