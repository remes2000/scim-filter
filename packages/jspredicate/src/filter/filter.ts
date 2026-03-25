import { Filter, Parser } from '@scim-filter/parse';
import { Optional } from './optional.js';
import * as DateValidator from '../date/date.js';

type Predicate<T> = (record: T, index: number, array: T[]) => boolean;
type Attribute = Array<string>;
type FieldValue = any;
type FilterValue = string | number | boolean | null;
type Comparator = <T>(a: T, b: T) => boolean;

export const createFilter = <T extends object>(rule: string): Predicate<T> => {
  const ast = new Parser(rule).parse();
  return (record: T, _index: number, _array: T[]) => matches(record, ast);
};

const matches = <T>(record: T, filter: Filter): boolean => {
  if (filter.operator === 'eq') {
    return eq(getFieldValue(record, filter.attribute), filter.value);
  } else if (filter.operator === 'ne') {
    return ne(getFieldValue(record, filter.attribute), filter.value);
  } else if (filter.operator === 'co') {
    return co(getFieldValue(record, filter.attribute), filter.value);
  } else if (filter.operator === 'sw') {
    return sw(getFieldValue(record, filter.attribute), filter.value);
  } else if (filter.operator === 'ew') {
    return ew(getFieldValue(record, filter.attribute), filter.value);
  } else if (filter.operator === 'gt') {
    return gt(getFieldValue(record, filter.attribute), filter.value);
  } else if (filter.operator === 'pr') {
    return pr(getFieldValue(record, filter.attribute));
  } else if (filter.operator === 'valuePath') {
    return valuePath(getFieldValue(record, filter.attribute), filter.filters[0]);
  } else if (filter.operator === 'and') {
    return and(record, filter.filters[0], filter.filters[1]);
  } else if (filter.operator === 'or') {
    return or(record, filter.filters[0], filter.filters[1]);
  } else if (filter.operator === 'not') {
    return not(record, filter.filters[0]);
  }
  return false;
};

/**
 * Traverses a record along an attribute path and returns the value at that path.
 *
 * @param record - The object to traverse.
 * @param attribute - An ordered list of property keys representing the path to the field.
 * @returns `Optional.some` with the field value if the path exists, `Optional.empty` otherwise.
 */
const getFieldValue = (record: any, attribute: Attribute): Optional<FieldValue> => {
  let current = record;
  const path = [ ...attribute ];

  while (path.length > 0) {
    const property = path.shift()!;
    if (typeof current !== 'object' || current === null) {
      return Optional.empty();
    }

    if (!(property in current)) {
      return Optional.empty();
    }

    current = current[property];
  }

  return Optional.some(current);
};

/**
 * Tests strict equality between a field value extracted from a record and a filter value.
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @param filterValue - The value from the filter rule to compare against.
 * @returns `true` if the field value is present and strictly equal to the filter value, `false` otherwise.
 */
const eq = (fieldValue: Optional<FieldValue>, filterValue: FilterValue): boolean =>
  Optional.match(fieldValue, (v) => v === filterValue);

/**
 * Tests strict inequality between a field value and a filter value.
 * If the field is absent, returns `false` (SQL NULL semantics).
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @param filterValue - The value from the filter rule to compare against.
 * @returns `true` if the field value is present and strictly not equal to the filter value, `false` otherwise.
 */
const ne = (fieldValue: Optional<FieldValue>, filterValue: FilterValue): boolean =>
  Optional.match(fieldValue, (v) => v !== filterValue);

/**
 * Tests whether a field value is present and non-empty.
 *
 * A value is considered present if it is not `null`, `undefined`, or an empty string.
 * For arrays, the value must have at least one element.
 * For objects, the value must have at least one key.
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @returns `true` if the field value is present and non-empty, `false` otherwise.
 */
const pr = (fieldValue: Optional<FieldValue>): boolean =>
  Optional.match(fieldValue, (v) => {
    if (v === '' || v === null || v === undefined) {
      return false;
    }
    if (Array.isArray(v)) {
      return v.length > 0;
    }
    if (typeof v === 'object') {
      return Object.keys(v).length > 0;
    }
    return true;
  });

/**
 * Tests whether a nested object at the attribute path satisfies a filter condition.
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @param filter - The filter condition to evaluate against the nested object.
 * @returns `true` if the field value is a non-null object and matches the filter, `false` otherwise.
 */
const valuePath = (fieldValue: Optional<FieldValue>, filter: Filter): boolean =>
  Optional.match(fieldValue, (v) => {
    if (typeof v === 'object' && v !== null) {
      return matches(v, filter);
    }
    return false;
  });

/**
 * Tests whether a field value contains the filter value as a case-insensitive substring.
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @param filterValue - The value from the filter rule to search for within the field value.
 * @returns `true` if both values are strings and the field value contains the filter value, `false` otherwise.
 */
const co = (fieldValue: Optional<FieldValue>, filterValue: FilterValue): boolean => {
  if (typeof filterValue !== 'string') {
    return false;
  }
  return Optional.match(fieldValue, (v) => {
    if (typeof v !== 'string') {
      return false;
    }
    return v.toLowerCase().includes(filterValue.toLowerCase());
  });
};

/**
 * Tests whether a field value starts with the filter value, using case-insensitive comparison.
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @param filterValue - The value from the filter rule to match against the start of the field value.
 * @returns `true` if both values are strings and the field value starts with the filter value, `false` otherwise.
 */
const sw = (fieldValue: Optional<FieldValue>, filterValue: FilterValue): boolean => {
  if (typeof filterValue !== 'string') {
    return false;
  }
  return Optional.match(fieldValue, (v) => {
    if (typeof v !== 'string') {
      return false;
    }
    return v.toLowerCase().startsWith(filterValue.toLowerCase());
  });
};

/**
 * Tests whether a field value ends with the filter value, using case-insensitive comparison.
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @param filterValue - The value from the filter rule to match against the end of the field value.
 * @returns `true` if both values are strings and the field value ends with the filter value, `false` otherwise.
 */
const ew = (fieldValue: Optional<FieldValue>, filterValue: FilterValue): boolean => {
  if (typeof filterValue !== 'string') {
    return false;
  }
  return Optional.match(fieldValue, (v) => {
    if (typeof v !== 'string') {
      return false;
    }
    return v.toLowerCase().endsWith(filterValue.toLowerCase());
  });
};

const compareWith = (compare: Comparator) => (fieldValue: Optional<FieldValue>, filterValue: FilterValue): boolean => {
  return Optional.match(fieldValue, (v) => {
    if (typeof filterValue === 'string') {
      if (typeof v !== 'string') {
        return false;
      }
      const shouldUseDateComparison = DateValidator.isValidFullDateString(filterValue);

      return shouldUseDateComparison 
       ? DateValidator.isValidDateString(v) && compare(Date.parse(v), Date.parse(filterValue))
       : compare(v.toLowerCase(), filterValue.toLowerCase());
    } else if (typeof filterValue === 'number') {
      return typeof v === 'number' && compare(v, filterValue);
    }
    return false;
  })  
};

/**
 * Tests whether a field value is greater than the filter value.
 *
 * For strings, compares using case-insensitive lexicographic ordering,
 * unless the filter value is a valid ISO 8601 date-time string with a full date prefix (YYYY-MM-DD) -
 * in which case, compares by parsed date (the field value must also be a valid date string).
 * This requirement for a full date prefix prevents bare numbers or partial strings
 * from accidentally triggering date comparison.
 * For numbers, uses standard numeric comparison.
 *
 * @param fieldValue - The value extracted from the record at the attribute path, wrapped in Optional.
 * @param filterValue - The value from the filter rule to compare against.
 * @returns `true` if the field value is present and greater than the filter value, `false` otherwise.
 */
const gt = compareWith((a, b) => a > b);

/**
 * Tests whether a record satisfies both filter conditions (logical AND).
 *
 * @param record - The object to evaluate.
 * @param filter1 - The first filter condition.
 * @param filter2 - The second filter condition.
 * @returns `true` if the record matches both filters, `false` otherwise.
 */
const and = <T>(record: T, filter1: Filter, filter2: Filter): boolean =>
  matches(record, filter1) && matches(record, filter2);

/**
 * Tests whether a record satisfies at least one of two filter conditions (logical OR).
 *
 * @param record - The object to evaluate.
 * @param filter1 - The first filter condition.
 * @param filter2 - The second filter condition.
 * @returns `true` if the record matches either filter, `false` otherwise.
 */
const or = <T>(record: T, filter1: Filter, filter2: Filter): boolean =>
  matches(record, filter1) || matches(record, filter2);

/**
 * Negates a filter condition (logical NOT).
 *
 * @param record - The object to evaluate.
 * @param filter - The filter condition to negate.
 * @returns `true` if the record does not match the filter, `false` otherwise.
 */
const not = <T>(record: T, filter: Filter): boolean =>
  !matches(record, filter);