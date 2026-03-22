import { Filter, Parser } from '@scim-filter/parse';
type Predicate<T> = (value: T, index: number, array: T[]) => boolean;

export const createFilter = <T extends object>(rule: string): Predicate<T> => {
  const ast = new Parser(rule).parse();
  return (value: T, index: number, array: T[]) => matches(value, ast);
};

const matches = <T>(value: T, filter: Filter): boolean => {
  return false;
};
