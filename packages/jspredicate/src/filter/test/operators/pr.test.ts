import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe.skip('Filter: pr operator', () => {
  it('firstName pr', () => {
    const users = [{ firstName: 'Michal' }, { lastName: 'John' }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([ { firstName: 'Michal' } ]);
  });

  it('should return false when null pr', () => {
    const users = [{ firstName: 'Michal' }, { firstName: null }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });

  it('should return false when undefined pr', () => {
    const users = [{ firstName: 'Michal' }, { firstName: undefined }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });

  it('should return false when \'\' pr', () => {
    const users = [{ firstName: 'Michal' }, { firstName: '' }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });

  it('should return false when [] pr', () => {
    const users = [{ firstName: 'Michal' }, { firstName: [] }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });

  it('should return false when {} pr', () => {
    const users = [{ firstName: 'Michal' }, { firstName: {} }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });
});