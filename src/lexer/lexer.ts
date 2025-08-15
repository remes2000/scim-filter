import { Walker } from "../walker/walker";
import { LOGICAL_OPERATORS, OPERATORS } from "./constants";
import { LogicalOperator, Operator, Token } from "./types";

const isAlpha = (char: string | null): char is string => {
  if (char === null) {
    return false;
  }
  return /^[a-zA-Z]$/.test(char);
};
const isDigit = (char: string | null): char is string => {
  if (char === null) {
    return false;
  }
  return /^[0-9]$/.test(char);
};

const isAlphaNumeric = (char: string | null): char is string => {
  return isAlpha(char) || isDigit(char);
};
const isWhitespace = (char: string | null): char is string => {
  if (char === null) {
    return false;
  }
  return /\s/.test(char);
};

const isOperator = (value: string): value is Operator => OPERATORS.includes(value);
const isLogicalOperator = (value: string): value is LogicalOperator => LOGICAL_OPERATORS.includes(value);

export class Lexer {
  private readonly walker: Walker<string>;
  private readonly tokens: Token[] = [];

  constructor(input: string) {
    this.walker = new Walker(input.split(''));
  }

  parse(): Token[] {
    while (!this.walker.isAtEnd()) {
      this.parseToken();
    }
    return [...this.tokens, { type: 'EOT' }];
  }

  parseToken() {
    const char = this.walker.advance();
    if (char === '(') {
      this.tokens.push({ type: 'OpenParenthesis', value: '(' });
    } else if (char === ')') {
      this.tokens.push({ type: 'CloseParenthesis', value: ')' });
    } else if (char === '[') {
      this.tokens.push({ type: 'OpenSquareParenthesis', value: '[' });
    } else if (char === ']') {
      this.tokens.push({ type: 'CloseSquareParenthesis', value: ']' });
    } else if (char === '.') {
      this.tokens.push({ type: 'Dot', value: '.' });
    } else if (char === '"') {
      this.parseString();
    } else if (isDigit(char) || char === '-') {
      this.parseNumber(char);
    } else if (isAlpha(char)){
      this.parseIdentifier(char);
    } else if (isWhitespace(char)) {
      return;
    } else {
      throw new Error(`Invalid character '${char}' at position ${this.walker.getCurrentPosition() - 1}`);
    }
  }

  parseString() {
    let value = '';
    const startPosition = this.walker.getCurrentPosition() - 1;

    while (this.walker.peak() !== '"' && !this.walker.isAtEnd()) {
      value += this.walker.advance();
    }
    if (this.walker.isAtEnd()) {
      throw new Error('Unterminated string literal, starting at position ' + startPosition); 
    }
    this.walker.advance(); // consume the closing quote
    this.tokens.push({ type: 'String', value });
  }

  // JSON number https://datatracker.ietf.org/doc/html/rfc7159#section-6
  parseNumber(startDigit: string) {
    let number = startDigit;
    if (number === '-') {
      // At this point there has to be at least one digit
      number += this.walker.consume(isDigit, 'Invalid number format, expected digit at position ' + this.walker.getCurrentPosition());
    }
    if (number.endsWith('0') && this.walker.check(isDigit)) {
      throw new Error('Invalid number format, leading zeros are not allowed at position ' + ( this.walker.getCurrentPosition() - 1));
    }
    // Read the rest of digits
    while (this.walker.check(isDigit)) {
      number += this.walker.advance();
    }
    if (this.walker.match((char) => char === '.')) {
      number += '.';
      number += this.walker.consume(isDigit, 'Invalid number format, expected digit at position ' + this.walker.getCurrentPosition());
    }
    // Read the rest of digits
    while (this.walker.check(isDigit)) {
      number += this.walker.advance();
    }
    if (this.walker.match((char) => char === 'e' || char === 'E')) {
      number += 'e';
      if (this.walker.check((char) => char === '+' || char === '-')) {
        number += this.walker.advance();
      }
      number += this.walker.consume(isDigit, 'Invalid number format, expected digit at position ' + this.walker.getCurrentPosition());
      while (this.walker.check(isDigit)) {
        number += this.walker.advance();
      }
    }
    this.tokens.push({ type: 'Number', value: Number(number) });
  }

  parseIdentifier(startChar: string) {
    let identifier = startChar;
    while (this.walker.check(isAlphaNumeric) || this.walker.check((char) => char === '-' || char === '_')) {
      identifier += this.walker.advance();
    }

    if (isOperator(identifier)) {
      this.tokens.push({ type: 'Operator', value: identifier });
    } else if (isLogicalOperator(identifier)) {
      this.tokens.push({ type: 'LogicalOperator', value: identifier });
    } else if (identifier === 'true' || identifier === 'false') {
      this.tokens.push({ type: 'Boolean', value: identifier === 'true' ? true : false });
    } else if (identifier === 'null') {
      this.tokens.push({ type: 'Null', value: null });
    } else {
      this.tokens.push({ type: 'Identifier', value: identifier });
    }
  }
}
