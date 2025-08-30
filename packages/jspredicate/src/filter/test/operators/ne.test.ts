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
});