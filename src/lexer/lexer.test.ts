import { describe, expect, it } from 'vitest';
import { Lexer } from './lexer';
import { Token } from './types';

const BACKSPACE = '\b';
const TAB = '\t';
const LINE_FEED = '\n';
const FORM_FEED = '\f';
const CARRIAGE_RETURN = '\r';

const check = (input: string, tokens: Token[]) => {
  const lexer = new Lexer(input);
  expect(lexer.parse()).toEqual(tokens);
};

const checkError = (input: string, expectedError: string) => {
  const lexer = new Lexer(input);
  expect(() => lexer.parse()).toThrow(expectedError);
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
      { type: 'Identifier', value: 'name' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'familyName' },
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
  // // TODO: handle SCIM schemas
  // // {
  // //   input: 'urn:ietf:params:scim:schemas:core:2.0:User:userName sw "J"',
  // //   expectedTokens: [
  // //     { type: 'Identifier', value: 'urn:ietf:params:scim:schemas:core:2.0:User:userName' },
  // //     { type: 'Operator', value: 'sw' },
  // //     { type: 'String', value: 'J' },
  // //     { type: 'EOT' }
  // //   ]
  // // },
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
      { type: 'Identifier', value: 'meta' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'lastModified' },
      { type: 'Operator', value: 'gt' },
      { type: 'String', value: '2011-05-13T04:42:34Z' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'meta.lastModified ge "2011-05-13T04:42:34Z"',
    expectedTokens: [
      { type: 'Identifier', value: 'meta' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'lastModified' },
      { type: 'Operator', value: 'ge' },
      { type: 'String', value: '2011-05-13T04:42:34Z' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'meta.lastModified lt "2011-05-13T04:42:34Z"',
    expectedTokens: [
      { type: 'Identifier', value: 'meta' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'lastModified' },
      { type: 'Operator', value: 'lt' },
      { type: 'String', value: '2011-05-13T04:42:34Z' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'meta.lastModified le "2011-05-13T04:42:34Z"',
    expectedTokens: [
      { type: 'Identifier', value: 'meta' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'lastModified' },
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
  // {
  //   input: 'schemas eq "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"',
  //   expectedTokens: [
  //     { type: 'Identifier', value: 'schemas' },
  //     { type: 'Operator', value: 'eq' },
  //     { type: 'String', value: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User' },
  //     { type: 'EOT' }
  //   ]
  // },
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
      { type: 'Identifier', value: 'emails' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'value' },
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
      { type: 'Identifier', value: 'emails' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'value' },
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
      { type: 'Identifier', value: 'emails' },
      { type: 'Dot', value: '.' },
      { type: 'Identifier', value: 'type' },
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
  // // Additional test cases
  // {
  //   input: 'userName eq "bij\"ensen"',
  //   expectedTokens: [
  //     { type: 'Identifier', value: 'userName' },
  //     { type: 'Operator', value: 'eq' },
  //     { type: 'String', value: 'bij"ensen' },
  //     { type: 'EOT' }
  //   ]
  // },
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
      { type: 'Number', value: 40 },
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
  },
  {
    input: '(age lt 25)',
    expectedTokens: [
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'lt' },
      { type: 'Number', value: 25 },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' } 
    ]
  },
  {
    input: '(isAdult eq true)',
    expectedTokens: [
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'isAdult' },
      { type: 'Operator', value: 'eq' },
      { type: 'Boolean', value: true },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' }
    ]
  },
  {
    input: '(parent eq null)',
    expectedTokens: [
      { type: 'OpenParenthesis', value: '(' },
      { type: 'Identifier', value: 'parent' },
      { type: 'Operator', value: 'eq' },
      { type: 'Null', value: null },
      { type: 'CloseParenthesis', value: ')' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'emails[numOfRecipients gt 0]',
    expectedTokens: [
      { type: 'Identifier', value: 'emails' },
      { type: 'OpenSquareParenthesis', value: '[' },
      { type: 'Identifier', value: 'numOfRecipients' },
      { type: 'Operator', value: 'gt' },
      { type: 'Number', value: 0 },
      { type: 'CloseSquareParenthesis', value: ']' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'emails[spam eq false]',
    expectedTokens: [
      { type: 'Identifier', value: 'emails' },
      { type: 'OpenSquareParenthesis', value: '[' },
      { type: 'Identifier', value: 'spam' },
      { type: 'Operator', value: 'eq' },
      { type: 'Boolean', value: false },
      { type: 'CloseSquareParenthesis', value: ']' },
      { type: 'EOT' }
    ]
  },
  {
    input: 'emails[spam eq null]',
    expectedTokens: [
      { type: 'Identifier', value: 'emails' },
      { type: 'OpenSquareParenthesis', value: '[' },
      { type: 'Identifier', value: 'spam' },
      { type: 'Operator', value: 'eq' },
      { type: 'Null', value: null },
      { type: 'CloseSquareParenthesis', value: ']' },
      { type: 'EOT' }
    ]
  },
  // JSON numbers
  {
    input: 'age eq -20',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: -20 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 0.5',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 0.5 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 0.25',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 0.25 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 12e3',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 12_000 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 12E3',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 12_000 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 12e+3',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 12_000 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 1e-2',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 0.01 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 2.5e2',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 250 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 2.5e-1',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 0.25 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'age eq 2e10',
    expectedTokens: [
      { type: 'Identifier', value: 'age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 20_000_000_000 },
      { type: 'EOT' }
    ]
  },
  // Attributes with special signs
  {
    input: 'user_age eq 20',
    expectedTokens: [
      { type: 'Identifier', value: 'user_age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 20 },
      { type: 'EOT' }
    ]
  },
  {
    input: 'user-age eq 20',
    expectedTokens: [
      { type: 'Identifier', value: 'user-age' },
      { type: 'Operator', value: 'eq' },
      { type: 'Number', value: 20 },
      { type: 'EOT' }
    ]
  },
  {
    input: '',
    expectedTokens: [{ type: 'EOT' }]
  },
  {
    input: ' ',
    expectedTokens: [{ type: 'EOT' }]
  },
  // Escaped strings
  { input: '"\\""', expectedTokens: [{ type: 'String', value: '"' }, { type: 'EOT' }]   },
  { input: '"\\\\"', expectedTokens: [{ type: 'String', value: '\\' }, { type: 'EOT' }]   },
  { input: '"/"', expectedTokens: [{ type: 'String', value: '/' }, { type: 'EOT' }]   },
  { input: '"\\/"', expectedTokens: [{ type: 'String', value: '/' }, { type: 'EOT' }]   },
  { input: '"\\' + BACKSPACE + '"', expectedTokens: [{ type: 'String', value: BACKSPACE }, { type: 'EOT' }]   },
  { input: '"\\' + FORM_FEED + '"', expectedTokens: [{ type: 'String', value: FORM_FEED }, { type: 'EOT' }]   },
  { input: '"\\' + LINE_FEED + '"', expectedTokens: [{ type: 'String', value: LINE_FEED }, { type: 'EOT' }]   },
  { input: '"\\' + CARRIAGE_RETURN + '"', expectedTokens: [{ type: 'String', value: CARRIAGE_RETURN }, { type: 'EOT' }]   },
  { input: '"\\' + TAB + '"', expectedTokens: [{ type: 'String', value: TAB }, { type: 'EOT' }]   },
  { input: '"\\u00bf"', expectedTokens: [{ type: 'String', value: '¿' }, { type: 'EOT' }] },
  { input: '"\\u00BF"', expectedTokens: [{ type: 'String', value: '¿' }, { type: 'EOT' }] },
];

const errorTestCases: { input: string; expectedError: string }[] = [
  {
    input: 'userName eq "unterminated',
    expectedError: 'Unterminated string literal, starting at position 12'
  },
  {
    input: 'user+name eq "Michael"',
    expectedError: `Invalid character '+' at position 4`
  },
  {
    input: 'age eq 1.',
    expectedError: 'Invalid number format, expected digit at position 9'
  },
  {
    input: 'age eq --2',
    expectedError: 'Invalid number format, expected digit at position 8'
  },
  {
    input: 'age eq 1e',
    expectedError: 'Invalid number format, expected digit at position 9'
  },
  {
    input: 'age eq 01',
    expectedError: 'Invalid number format, leading zeros are not allowed at position 7'
  },
  {
    input: 'age eq -01',
    expectedError: 'Invalid number format, leading zeros are not allowed at position 8'
  },
  {
    input: '"\\',
    expectedError: 'Unterminated string literal, starting at position 0'
  },
  {
    input: '"\\u1"',
    expectedError: 'Invalid escape sequence, expected hexadecimal digit at position 4'
  },
  { 
    input: '"' + BACKSPACE + '"',
    expectedError: 'Invalid string character at position 1'
  },
  { 
    input: '"' + FORM_FEED + '"',
    expectedError: 'Invalid string character at position 1'
  },
  { 
    input: '"' + LINE_FEED + '"',
    expectedError: 'Invalid string character at position 1'
  },
  { 
    input: '"' + CARRIAGE_RETURN + '"',
    expectedError: 'Invalid string character at position 1'
  },
  { 
    input: '"' + TAB + '"',
    expectedError: 'Invalid string character at position 1'
  },
];

describe('SCIM Filter Lexer', () => {
  testCases.forEach(({ input, expectedTokens }) => {
    it(input, () => {
      check(input, expectedTokens);
    });
  });

  describe('Error cases', () => {
    errorTestCases.forEach(({ input, expectedError }) => {
      it(`should throw error for: ${input}`, () => {
        checkError(input, expectedError);
      });
    });
  });
});
