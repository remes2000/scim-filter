// I'm not sure if that file belongs here. Now, I only want to validate
// If the whole setup is ready to be used

import { Lexer } from "../lexer/lexer-old";
import { Parser } from "../parser/parser";

type Predicate<T> = (value: T, index: number, array: T[]) => boolean;
export const createFilter = <T extends object>(rule: string): Predicate<T> => {
  const tokens = new Lexer(rule).parse();
  const filter = new Parser(tokens).parse();

  return (value: T, index: number, array: T[]) => {
    if (filter.operator === 'eq') {
      return eq(value, filter.attribute, filter.value);
    }
    return false;
  };
};

const eq = <T extends object>(item: T, attribute: string, value: string | number | boolean | null) =>
  get(item, attribute) === value;

const get = <T extends object>(object: T, key: string) => {
  if (Object.hasOwn(object, key)) {
    // TODO: handle
    const value: any = object[key];
    return value;
  }
  return null;
};
