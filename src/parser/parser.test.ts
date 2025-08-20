import { describe, it, expect } from 'vitest';
import { Parser } from './parser';
import { Lexer } from '../lexer/lexer';
import { Filter } from './types';

const check = (expression: string, expected: Filter) => {
  const tokens = new Lexer(expression).parse();
  const parsedTree = new Parser(tokens).parse();
  expect(parsedTree).toEqual(expected);
};

describe('Parser', () => {
  it('should parse simple equality expression', () => {
    check('userName eq "john"', {
      attribute: ['userName'],
      operator: 'eq',
      value: 'john'
    });
  });

  it('should parse expression with AND operator', () => {
    check('userName eq "john" and age lt 25', {
      operator: 'and',
      filters: [
        { attribute: ['userName'], operator: 'eq', value: 'john' },
        { attribute: ['age'], operator: 'lt', value: 25 }
      ]
    });
  });

  it('should parse complex expression with operator precedence', () => {
    check('userName eq "john" or userName eq "mike" and age lt 30', {
      operator: 'or',
      filters: [
        { attribute: ['userName'], operator: 'eq', value: 'john' },
        {
          operator: 'and',
          filters: [
            { attribute: ['userName'], operator: 'eq', value: 'mike' },
            { attribute: ['age'], operator: 'lt', value: 30 },
          ]
        }
      ]
    });
  });

  it('should parse expression with parentheses grouping', () => {
    check('(userName eq "john" or userName eq "mike") and age lt 30', {
      operator: 'and',
      filters: [
        {
          operator: 'or',
          filters: [
            { attribute: ['userName'], operator: 'eq', value: 'john' },
            { attribute: ['userName'], operator: 'eq', value: 'mike' }
          ]
        },
        { attribute: ['age'], operator: 'lt', value: 30 }
      ]
    });
  });

  it('should parse expression with pr operator', () => {
    check('title pr', { attribute: ['title'], operator: 'pr' });
  });

  it('should parse expression with not operator', () => {
    check('not (userName eq "john")', {
      operator: 'not',
      filters: [{ attribute: ['userName'], operator: 'eq', value: 'john' }]
    });
  });

  it('should throw error when not is not before grouping', () => {
    const tokens = new Lexer('not userName eq "john"').parse();
    expect(() => new Parser(tokens).parse()).toThrow('Expected group after "not" operator');
  });

  it('should parse value path with logical operator', () => {
   check('emails[type eq "work" and value co "@example.com"]', {
      attribute: ['emails'],
      operator: 'valuePath',
      filters: [{
        operator: 'and',
        filters: [
          { attribute: ['type'], operator: 'eq', value: 'work' },
          { attribute: ['value'], operator: 'co', value: '@example.com' }
        ]
      }]
   });
  });

  it('should parse attribute with subattributes', () => {
    check('user.address.street eq "123 Main St"', {
      attribute: ['user', 'address', 'street'],
      operator: 'eq',
      value: '123 Main St'
    });
  });
});
