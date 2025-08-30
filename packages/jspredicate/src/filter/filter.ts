import { Parser } from '@scim-filter/parse';

type Predicate<T> = (value: T, index: number, array: T[]) => boolean;
type Value = string | number | boolean | null;
type Optional<T> = { hasValue: true, value: Value } | { hasValue: false };
const hasValue = <T>(o: Optional<T>): o is { hasValue: true, value: Value } => o.hasValue;

const eq = (attributeValue: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValue)) {
    return false;
  }
  return attributeValue.value === value;
}
const ne = (attributeValue: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValue)) {
    return false;
  }
  return attributeValue.value !== value
};
// TODO: consider if it should be case insensitive
// TODO: add better test case descriptions
const sw = (attributeValueOpt: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValueOpt)) {
    return false;
  }

  const attributeValue = attributeValueOpt.value;
  if (typeof value !== 'string') {
    throw new Error(`Value for \'sw\' operator has to be a string. '${value}' is not a string.`);
  }
  if (typeof attributeValue !== 'string' && attributeValue !== null && attributeValue !== undefined) {
    throw new Error('Attribute value for \'sw\' operator has to be a string. Non-string value encountered.');
  }
  return (attributeValue ?? '').startsWith(value);
};
const ew = (attributeValueOpt: Optional<Value>, value: unknown) => {
  if (!hasValue(attributeValueOpt)) {
    return false;
  }

  const attributeValue= attributeValueOpt.value;
  if (typeof value !== 'string') {
    throw new Error(`Value for \'ew\' operator has to be a string. '${value}' is not a string.`);
  }
  if (typeof attributeValue !== 'string' && attributeValue !== null && attributeValue !== undefined) {
    throw new Error('Attribute value for \'ew\' operator has to be a string. Non-string value encountered.');
  }
  return (attributeValue ?? '').endsWith(value);
};

const pr = (attributeValueOpt: Optional<Value>) => {
  if (hasValue(attributeValueOpt)) {
    const attributeValue = attributeValueOpt.value;
    return attributeValue !== null && attributeValue !== undefined;
  }
  return false;
};

const binaryOperatorMap = { eq, ne, sw, ew };
const unaryOperatorMap = { pr };

export const createFilter = <T extends object>(rule: string): Predicate<T> => {
  const ast = new Parser(rule).parse();

  return (value: T, index: number, array: T[]) => {
    switch (ast.operator) {
      case 'eq':
      case 'ne':
      case 'sw':
      case 'ew': 
        return binaryOperatorMap[ast.operator](get(value, ast.attribute), ast.value);
      case 'pr':
        return unaryOperatorMap[ast.operator](get(value, ast.attribute));
    }
    return false;
  };
};

const get = (object: any, key: Array<string>): { hasValue: true, value: Value } | { hasValue: false } => {
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
