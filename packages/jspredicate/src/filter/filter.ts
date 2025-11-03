import { Filter, Parser } from '@scim-filter/parse';

type Predicate<T> = (value: T, index: number, array: T[]) => boolean;
type Value = string | number | boolean | null | object;
type Optional<T> = { hasValue: true, value: T } | { hasValue: false };
const hasValue = <T>(o: Optional<T>): o is { hasValue: true, value: T } => o.hasValue;

/*
  Equal operator.
  For missing attribute is always returns false.
  In other cases, it compares the values using ===
*/
const eq = (attributeValue: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValue)) {
    return false;
  }
  return attributeValue.value === value;
}

/*
  Not equal operator.
  For missing attribute it always returns true.
  In other cases, it compares the values using !==
*/
const ne = (attributeValue: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValue)) {
    return true;
  }
  return attributeValue.value !== value;
};

/*
  Starts with operator. Works only for string.
  It's case sensitive.
  If provided compare value is not a string it throws an error.
  For missing attribute it always returns false.
  If the attribute is not a string it returns false.
*/
const sw = (attributeValueOpt: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValueOpt)) {
    return false;
  }

  const attributeValue = attributeValueOpt.value;
  if (typeof value !== 'string') {
    throw new Error(`Value for \'sw\' operator has to be a string. ${value} is not a string.`);
  }

  if (typeof attributeValue !== 'string') {
    return false;
  }
  return attributeValue.startsWith(value);
};

/*
  Ends with operator. Works only for string.
  It's case sensitive.
  If provided compare value is not a string it throws an error.
  For missing attribute it always returns false.
  If the attribute is not a string it returns false.
*/
const ew = (attributeValueOpt: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValueOpt)) {
    return false;
  }

  const attributeValue = attributeValueOpt.value;
  if (typeof value !== 'string') {
    throw new Error(`Value for \'ew\' operator has to be a string. ${value} is not a string.`);
  }
  if (typeof attributeValue !== 'string') {
    return false;
  }
  return attributeValue.endsWith(value);
};

/*
  Contains operator. Works only for string.
  It's case sensitive.
  If provided compare value is not a string it throws an error.
  For missing attribute it always returns false.
  If the attribute is not a string it returns false.
*/
const co = (attributeValueOpt: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValueOpt)) {
    return false;
  }

  const attributeValue = attributeValueOpt.value;
  if (typeof value !== 'string') {
    throw new Error(`Value for \'co\' operator has to be a string. ${value} is not a string.`);
  }
  if (typeof attributeValue !== 'string') {
    return false;
  }
  return attributeValue.includes(value);
};

/*
  Present operator.
  For missing attribute, it always returns false.
  If the attribute is undefined it returns false.
  If the attribute is null it returns false.
  If the attribute is '' (empty string) it returns false.
  If the attribute is [] (empty array) it returns false.
  Otherwise returns true.
*/
const pr = (attributeValueOpt: Optional<Value>) => {
  if (hasValue(attributeValueOpt)) {
    const attributeValue = attributeValueOpt.value;
    return (
      attributeValue !== null &&
      attributeValue !== undefined &&
      attributeValue !== '' &&
      !(Array.isArray(attributeValue) && attributeValue.length === 0) &&
      !(typeof attributeValue === 'object' && Object.keys(attributeValue).length === 0)
    )
  }
  return false;
};

/*
  Value path operator.
*/
const valuePath = (attributeValueOpt: Optional<Value>, filter: Filter) => {
  if (!hasValue(attributeValueOpt)) {
    return false;
  }

  if (typeof attributeValueOpt.value !== 'object') {
    return false;
  }

  return matches(attributeValueOpt.value, filter);
};

const binaryOperatorMap = { eq, ne, sw, ew, co };
const binaryFilterOperatorMap = { valuePath };
const unaryOperatorMap = { pr };

export const createFilter = <T extends object>(rule: string): Predicate<T> => {
  const ast = new Parser(rule).parse();
  return (value: T, index: number, array: T[]) => matches(value, ast);
};

const matches = <T>(value: T, filter: Filter): boolean => {
  switch (filter.operator) {
    case 'eq':
    case 'ne':
    case 'sw':
    case 'ew':
    case 'co':
      return binaryOperatorMap[filter.operator](get(value, filter.attribute), filter.value);
    case 'pr':
      return unaryOperatorMap[filter.operator](get(value, filter.attribute));
    case 'valuePath':
      // TODO: Am I sure that the user can just filter.filters[0] will there always be just one filter?
      return binaryFilterOperatorMap[filter.operator](get(value, filter.attribute), filter.filters[0])
    case 'and':
      return filter.filters.every(f => matches(value, f));
    case 'or':
      return filter.filters.some(f => matches(value, f))
    case 'not':
      return filter.filters.every(f => !matches(value, f));
  }
  return false;
};

const get = (object: any, key: Array<string>): Optional<Value> => {
  let current: any = object;
  for (const k of key) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return { hasValue: false };
    }
  }
  return { hasValue: true, value: current };
};
