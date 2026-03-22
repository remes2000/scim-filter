import { Filter, Parser } from '@scim-filter/parse';
import { Optional } from './optional.js';

type Predicate<T> = (record: T, index: number, array: T[]) => boolean;
type Attribute = Array<string>;
type FieldValue = any;
type FilterValue = string | number | boolean | null;

export const createFilter = <T extends object>(rule: string): Predicate<T> => {
  const ast = new Parser(rule).parse();
  return (record: T, _index: number, _array: T[]) => matches(record, ast);
};

const matches = <T>(record: T, filter: Filter): boolean => {
  if (filter.operator === 'eq') {
    return eq(getFieldValue(record, filter.attribute), filter.value);
  } else if (filter.operator === 'pr') {
    return pr(getFieldValue(record, filter.attribute));
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
