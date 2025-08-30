import { describe, expect, it } from 'vitest';
import { createFilter } from '../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: pr operator', () => {
  it('firstName pr', () => {
    const users = [{ firstName: 'Michal' }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([ { firstName: 'Michal' } ]);
  });

  it('pr on null should filter out the object', () => {
    const users = [{ firstName: 'Michal' }, { firstName: null }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });

  it('pr on undefined should filter out the object', () => {
    const users = [{ firstName: 'Michal' }, { firstName: undefined }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });

  it('pr on missing attribute should filter out the object', () => {
    const users = [{ firstName: 'Michal' }, { lastName: 'Kowalski' }];
    expect(filterArray(users, 'firstName pr'))
      .toEqual([{ firstName: 'Michal' }]);
  });

  // TODO: how about empty string, empty array, empty object, 0, false?
});