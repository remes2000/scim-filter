import { describe, expect, it } from "vitest";
import { createFilter } from "../../filter.js";

describe.skip('Filter: and logical operator', () => {
  const filterArray = (array: Array<object>, filter: string) =>
    array.filter(createFilter(filter));

    it('firstName eq "Michal" and lastName eq "Nieruchalski"', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Michal', lastName: 'Wisniowiecki' }
    ];

    expect(filterArray(users, 'firstName eq "Michal" and lastName eq "Nieruchalski"'))
      .toEqual([{ firstName: 'Michal', lastName: 'Nieruchalski' }]);
  });
});
