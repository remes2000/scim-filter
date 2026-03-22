import { describe, expect, it } from "vitest";
import { createFilter } from "../../filter.js";

describe.skip('Filter: not logical operator', () => {
  const filterArray = (array: Array<object>, filter: string) =>
    array.filter(createFilter(filter));

    it('not (lastName eq "Nieruchalski")', () => {
    const users = [
      { firstName: 'Michal', lastName: 'Nieruchalski' },
      { firstName: 'Michal', lastName: 'Wisniowiecki' }
    ];

    expect(filterArray(users, 'not (lastName eq "Nieruchalski")'))
      .toEqual([{ firstName: 'Michal', lastName: 'Wisniowiecki' }]);
  });
});
