import { describe, expect, it } from "vitest";
import { createFilter } from "../../filter.js";

describe.skip('Filter: or logical operator', () => {
  const filterArray = (array: Array<object>, filter: string) =>
    array.filter(createFilter(filter));

    it('firstName eq "Jan" or firstName eq "Jakub"', () => {
    const users = [
      { firstName: 'Michal' },
      { firstName: 'Jan' },
      { firstName: 'Jakub' }
    ];

    expect(filterArray(users, 'firstName eq "Jan" or firstName eq "Jakub"'))
      .toEqual([{ firstName: 'Jan' }, { firstName: 'Jakub' }]);
  });
});
