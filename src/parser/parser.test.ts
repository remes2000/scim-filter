import { describe, it, expect } from 'vitest';
import { Parser } from './parser';
import { Lexer } from '../lexer/lexer';
import { Expression } from './types';

const check = (expression: string, expected: Expression) => {
  const tokens = new Lexer(expression).parse();
  const parsedTree = new Parser(tokens).parse();
  expect(parsedTree).toEqual(expected);
};

describe('Parser', () => {
  it('should parse simple equality expression', () => {
    check('userName eq "john"', {
      identifier: 'userName',
      operator: 'eq',
      value: 'john'
    });
  });

  it('should parse expression with AND operator', () => {
    check('userName eq "john" and age lt 25', {
      left: {
        identifier: 'userName',
        operator: 'eq',
        value: 'john'
      },
      operator: 'and',
      right: {
        identifier: 'age',
        operator: 'lt',
        value: '25'
      }
    });
  });

  it('should parse complex expression with operator precedence', () => {
    check('userName eq "john" or userName eq "mike" and age lt 30', {
      left: {
        identifier: 'userName',
        operator: 'eq',
        value: 'john'
      },
      operator: 'or',
      right: {
        left: {
          identifier: 'userName',
          operator: 'eq',
          value: 'mike'
        },
        operator: 'and',
        right: {
          identifier: 'age',
          operator: 'lt',
          value: '30'
        }
      }
    });
  });

  it('should parse expression with parentheses grouping', () => {
    check('(userName eq "john" or userName eq "mike") and age lt 30', {
      left: {
        left: {
          identifier: 'userName',
          operator: 'eq',
          value: 'john'
        },
        operator: 'or',
        right: {
          identifier: 'userName',
          operator: 'eq',
          value: 'mike'
        }
      },
      operator: 'and',
      right: {
        identifier: 'age',
        operator: 'lt',
        value: '30'
      }
    });
  });

  it('should parse expression with pr operator', () => {
    check('title pr', {
      identifier: 'title',
      operator: 'pr',
    });
  });

  it('should parse expression with not operator', () => {
    check('not (userName eq "john")', {
      operator: 'not',
      right: {
        identifier: 'userName',
        operator: 'eq',
        value: 'john'
      }
    });
  });

  it('should throw error when not is not before grouping', () => {
    const tokens = new Lexer('not userName eq "john"').parse();
    expect(() => new Parser(tokens).parse()).toThrow('Expected group after "not" operator');
  });

  it('should parse value path with logical operator', () => {
   check('emails[type eq "work" and value co "@example.com"]', {
      identifier: 'emails',
      expression: {
        left: {
          identifier: 'type',
          operator: 'eq',
          value: 'work'
        },
        operator: 'and',
        right: {
          identifier: 'value',
          operator: 'co',
          value: '@example.com'
        }
      }
   });
  });
});
