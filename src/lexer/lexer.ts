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

  parse() {
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
    } else if (isDigit(char)) {
      this.parseNumber();
    } else if (isAlpha(char)){
      this.parseIdentifier(char);
    } else if (isWhitespace(char)) {
      return;
    } else {
      throw new Error(`Invalid character '${char}' at position ${this.walker.getCurrentPosition()}`);
    }
  }

  parseString() {
    let value = '';
    const startPosition = this.walker.getCurrentPosition() - 1;
    while (this.walker.peak() !== '"') {
      if (this.walker.isAtEnd()) {
        throw new Error('Unterminated string literal, starting at position ' + startPosition); 
      }
      value += this.walker.advance();
    }
    this.walker.advance(); // consume the closing quote
    this.tokens.push({ type: 'String', value });
  }

  parseNumber() {
    // TODO: parse number
  }

  parseIdentifier(startChar: string) {
    let identifier = startChar;
    while (this.walker.check(isAlphaNumeric)) {
      identifier += this.walker.advance();

      if (this.walker.isAtEnd()) {
        break;
      }
    }
    // TODO: add support for booleans and null 
    if (isOperator(identifier)) {
      this.tokens.push({ type: 'Operator', value: identifier });
    } else if (isLogicalOperator(identifier)) {
      this.tokens.push({ type: 'LogicalOperator', value: identifier });
    } else {
      this.tokens.push({ type: 'Identifier', value: identifier });
    }
  }
}
