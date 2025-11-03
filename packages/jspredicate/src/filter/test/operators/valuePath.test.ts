import { describe, expect, it } from 'vitest';
import { createFilter } from '../../filter.js';

const filterArray = (array: Array<object>, filter: string) =>
  array.filter(createFilter(filter));

describe('Filter: valuePath operator', () => {
  it('address[city eq "Poznan"]', () => {
    const users = [
      { name: 'A', address: { city: 'Poznan', street: 'Polwiejska' } },
      { name: 'B', address: { city: 'Warsaw', street: 'Foksal' } }
    ];
    expect(filterArray(users, 'address[city eq "Poznan"]'))
      .toEqual([ { name: 'A', address: { city: 'Poznan', street: 'Polwiejska' } } ]);
  });

  it('should handle nested', () => {
    const users = [
      { name: 'A', address: { city: 'Poznan', street: 'Polwiejska', details: { flatNumber: 30 } } },
      { name: 'B', address: { city: 'Warsaw', street: 'Foksal', details: { flatNumber: 32 } } }
    ];
    expect(filterArray(users, 'address[details[flatNumber eq 32]]'))
      .toEqual([ { name: 'B', address: { city: 'Warsaw', street: 'Foksal', details: { flatNumber: 32 } } } ]);    
  });

  it('should return false when attribute is missing', () => {
    const users = [{ name: 'Michal' }];
    expect(filterArray(users, 'address[street eq "Foksal"]')).toEqual([]);
  });

  it('should return false when attribute is not an object', () => {
    const users = [{ name: 'Michal' }];
    expect(filterArray(users, 'name[first sw "Pi"]')).toEqual([]);
  });
});
