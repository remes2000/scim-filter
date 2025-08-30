import { describe, expect, it } from 'vitest';
import { createFilter } from '../filter.js';

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
});