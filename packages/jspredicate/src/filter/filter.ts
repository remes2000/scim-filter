import { Parser } from '@scim-filter/parse';

type Predicate<T> = (value: T, index: number, array: T[]) => boolean;
type Value = string | number | boolean | null;

const eq = (attributeValue: Value, value: unknown) => attributeValue === value;
const ne = (attributeValue: Value, value: unknown) => attributeValue !== value;
// TODO: consider if it should be case insensitive
// TODO: add better test case descriptions
const sw = (attributeValue: Value, value: unknown) => {
  if (typeof value !== 'string') {
    throw new Error(`Value for \'sw\' operator has to be a string. '${value}' is not a string.`);
  }
  if (typeof attributeValue !== 'string' && attributeValue !== null && attributeValue !== undefined) {
    throw new Error('Attribute value for \'sw\' operator has to be a string. Non-string value encountered.');
  }
  return (attributeValue ?? '').startsWith(value);
};
const ew = (attributeValue: Value, value: unknown) => {
  if (typeof value !== 'string') {
    throw new Error(`Value for \'ew\' operator has to be a string. '${value}' is not a string.`);
  }
  if (typeof attributeValue !== 'string' && attributeValue !== null && attributeValue !== undefined) {
    throw new Error('Attribute value for \'ew\' operator has to be a string. Non-string value encountered.');
  }
  return (attributeValue ?? '').endsWith(value);
};
const pr = (attributeValue: Value) => attributeValue !== null && attributeValue !== undefined;

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

const get = <T extends object>(object: T, key: Array<string>) => {
  let current: any = object;
  for (const k of key) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // TODO: come up with a better error handling
      throw new Error(`Property ${k} does not exist on ${JSON.stringify(current)}`);
    }
  }
  return current;
};
