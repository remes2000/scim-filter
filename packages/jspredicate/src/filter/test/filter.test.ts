import { describe, expect, it } from "vitest";
import { createFilter } from "../filter.js";

describe('Filter', () => {
  const filterArray = (array: Array<object>, filter: string) =>
    array.filter(createFilter(filter));

  describe('sub attributes', () => {
    it('name.firstName eq "Michal"', () => {
      const users = [
        { name: { firstName: 'Michal', lastName: 'Nieruchalski' } },
        { name: { firstName: 'Jan', lastName: 'Kowalski' } }
      ];
      expect(filterArray(users, 'name.firstName eq "Michal"'))
        .toEqual([{ name: { firstName: 'Michal', lastName: 'Nieruchalski' } }]);
    });
  })
});
