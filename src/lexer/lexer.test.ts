import { describe, expect, it } from 'vitest';
import { Lexer, Token, LexerError, LexerErrorType, InvalidOperatorError, InvalidValueError, UnterminatedStringError, InvalidLogicalOperatorError, MissingParenthesisAfterNotError, UnexpectedEndOfInputError } from './lexer';

const check = (input: string, tokens: Token[]) => {
  const lexer = new Lexer(input);
  expect(lexer.parse()).toEqual(tokens);
};

const testCases: { input: string; expectedTokens: Token[] }[] = [
  {
    input: 'userName eq "bjensen"',
    expectedTokens: [
      { type: 'Identifier', value: 'userName' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'bjensen' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'name.familyName co "O\'Malley"',
    expectedTokens: [
      { type: 'Identifier', value: 'name.familyName' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: 'O\'Malley' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'userName sw "J"',
    expectedTokens: [
      { type: 'Identifier', value: 'userName' },
      { type: 'Operator', value: 'sw' },
      { type: 'String', value: 'J' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'urn:ietf:params:scim:schemas:core:2.0:User:userName sw "J"',
    expectedTokens: [
      { type: 'Identifier', value: 'urn:ietf:params:scim:schemas:core:2.0:User:userName' },
      { type: 'Operator', value: 'sw' },
      { type: 'String', value: 'J' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'title pr',
    expectedTokens: [
      { type: 'Identifier', value: 'title' },
      { type: 'Operator', value: 'pr' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'meta.lastModified gt "2011-05-13T04:42:34Z"',
    expectedTokens: [
      { type: 'Identifier', value: 'meta.lastModified' },
      { type: 'Operator', value: 'gt' },
      { type: 'String', value: '2011-05-13T04:42:34Z' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'meta.lastModified ge "2011-05-13T04:42:34Z"',
    expectedTokens: [
      { type: 'Identifier', value: 'meta.lastModified' },
      { type: 'Operator', value: 'ge' },
      { type: 'String', value: '2011-05-13T04:42:34Z' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'meta.lastModified lt "2011-05-13T04:42:34Z"',
    expectedTokens: [
      { type: 'Identifier', value: 'meta.lastModified' },
      { type: 'Operator', value: 'lt' },
      { type: 'String', value: '2011-05-13T04:42:34Z' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'meta.lastModified le "2011-05-13T04:42:34Z"',
    expectedTokens: [
      { type: 'Identifier', value: 'meta.lastModified' },
      { type: 'Operator', value: 'le' },
      { type: 'String', value: '2011-05-13T04:42:34Z' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'title pr and userType eq "Employee"',
    expectedTokens: [
      { type: 'Identifier', value: 'title' },
      { type: 'Operator', value: 'pr' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'Employee' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'title pr or userType eq "Intern"',
    expectedTokens: [
      { type: 'Identifier', value: 'title' },
      { type: 'Operator', value: 'pr' },
      { type: 'LogicalOperator', value: 'or' },
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'Intern' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'schemas eq "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"',
    expectedTokens: [
      { type: 'Identifier', value: 'schemas' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'userType eq "Employee" and (emails co "example.com" or emails.value co "example.org")',
    expectedTokens: [
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'Employee' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'emails' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: 'example.com' },
      { type: 'LogicalOperator', value: 'or' },
      { type: 'Identifier', value: 'emails.value' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: 'example.org' },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'userType ne "Employee" and not (emails co "example.com" or emails.value co "example.org")',
    expectedTokens: [
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'ne' },
      { type: 'String', value: 'Employee' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'LogicalOperator', value: 'not' },
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'emails' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: 'example.com' },
      { type: 'LogicalOperator', value: 'or' },
      { type: 'Identifier', value: 'emails.value' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: 'example.org' },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'userType eq "Employee" and (emails.type eq "work")',
    expectedTokens: [
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'Employee' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'emails.type' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'work' },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'userType eq "Employee" and emails[type eq "work" and value co "@example.com"]',
    expectedTokens: [
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'Employee' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'Identifier', value: 'emails' },
      { type: 'OpenSquareParenthesis', value: '[' },
      { type: 'Identifier', value: 'type' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'work' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'Identifier', value: 'value' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: '@example.com' },
      { type: 'CloseSquareParenthesis', value: ']' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'emails[type eq "work" and value co "@example.com"] or ims[type eq "xmpp" and value co "@foo.com"]',
    expectedTokens: [
      { type: 'Identifier', value: 'emails' },
      { type: 'OpenSquareParenthesis', value: '[' },
      { type: 'Identifier', value: 'type' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'work' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'Identifier', value: 'value' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: '@example.com' },
      { type: 'CloseSquareParenthesis', value: ']' },
      { type: 'LogicalOperator', value: 'or' },
      { type: 'Identifier', value: 'ims' },
      { type: 'OpenSquareParenthesis', value: '[' },
      { type: 'Identifier', value: 'type' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'xmpp' },
      { type: 'LogicalOperator', value: 'and' },
      { type: 'Identifier', value: 'value' },
      { type: 'Operator', value: 'co' },
      { type: 'String', value: '@foo.com' },
      { type: 'CloseSquareParenthesis', value: ']' },
      { type: 'EOT' }
    ]
  },
  // Additional test cases
  {
    input: 'active eq true',
    expectedTokens: [
      { type: 'Identifier', value: 'active' },
      { type: 'Operator', value: 'eq' },
      { type: 'Boolean', value: true },
      { type: 'EOT' }
    ]
  },
  {
    input: 'active eq false',
    expectedTokens: [
      { type: 'Identifier', value: 'active' },
      { type: 'Operator', value: 'eq' },
      { type: 'Boolean', value: false },
      { type: 'EOT' }
    ]
  },
  {
    input: 'active eq null',
    expectedTokens: [
      { type: 'Identifier', value: 'active' },
      { type: 'Operator', value: 'eq' },
      { type: 'Null', value: null },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age lt 40',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'lt' },
      { type: 'Number', value: '40' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'not(userType eq "Employee")',
    expectedTokens: [
      { type: 'LogicalOperator', value: 'not' },
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'Employee' },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'not (userType eq "Employee")',
    expectedTokens: [
      { type: 'LogicalOperator', value: 'not' },
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'userType' },
      { type: 'Operator', value: 'eq' },
      { type: 'String', value: 'Employee' },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' }
    ]
  }
];

describe('SCIM Filter Lexer', () => {
  testCases.forEach(({ input, expectedTokens }) => {
    it(input, () => {
      check(input, expectedTokens);
    });
  });
});

// These tests are AI generated. I have to carefully review them:

// describe('SCIM Filter Lexer - Error Handling', () => {
//   it('should throw InvalidOperatorError for invalid operator', () => {
//     const lexer = new Lexer('userName invalid "value"');
//     expect(() => lexer.parse()).toThrow(InvalidOperatorError);
//     expect(() => lexer.parse()).toThrow('is not a valid operator');
//   });

//   it('should throw InvalidValueError for invalid value', () => {
//     const lexer = new Lexer('userName eq invalidValue');
//     expect(() => lexer.parse()).toThrow(InvalidValueError);
//     expect(() => lexer.parse()).toThrow('is not a valid value');
//   });

//   it('should throw UnterminatedStringError for unterminated string', () => {
//     const lexer = new Lexer('userName eq "unterminated');
//     expect(() => lexer.parse()).toThrow(UnterminatedStringError);
//     expect(() => lexer.parse()).toThrow('Unterminated string literal');
//   });

//   it('should throw InvalidLogicalOperatorError for invalid logical operator', () => {
//     const lexer = new Lexer('userName eq "test" invalid');
//     expect(() => lexer.parse()).toThrow(InvalidLogicalOperatorError);
//     expect(() => lexer.parse()).toThrow('is not a valid logical operator');
//   });

//   it('should throw MissingParenthesisAfterNotError when not is not followed by parenthesis', () => {
//     const lexer = new Lexer('not userName eq "test"');
//     expect(() => lexer.parse()).toThrow(MissingParenthesisAfterNotError);
//     expect(() => lexer.parse()).toThrow('Expected \'(\' after \'not\' operator');
//   });

//   it('should throw UnexpectedEndOfInputError for incomplete input', () => {
//     const lexer = new Lexer('userName eq "test" incomplete');
//     expect(() => lexer.parse()).toThrow(UnexpectedEndOfInputError);
//     expect(() => lexer.parse()).toThrow('Unexpected end of input');
//   });

//   it('should provide error type information', () => {
//     const lexer = new Lexer('userName invalid "value"');
//     try {
//       lexer.parse();
//     } catch (error) {
//       expect(error).toBeInstanceOf(LexerError);
//       expect((error as LexerError).errorType).toBe(LexerErrorType.INVALID_OPERATOR);
//       expect((error as LexerError).expected).toEqual(['eq', 'ne', 'co', 'sw', 'ew', 'gt', 'ge', 'lt', 'le', 'pr']);
//     }
//   });
// });

/* 
TODO: test cases
- Empty input
- Only whitespace
*/
