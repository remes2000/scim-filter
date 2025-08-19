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

  // JSON string: https://datatracker.ietf.org/doc/html/rfc7159#section-7
  parseString() {
    let value = '';
    const startPosition = this.walker.getCurrentPosition() - 1;
    const isBackslash = (char: string | null): char is '\\' => char === '\\';
    const isStringCharacter = (char: string | null): char is string => {
      if (char === null) {
        return false;
      }
      const codePoint = char.codePointAt(0);
      if (codePoint === undefined) {
        return false;
      }
      // unescaped = %x20-21 / %x23-5B / %x5D-10FFFF
      return (codePoint >= 0x20 && codePoint <= 0x21) ||
             (codePoint >= 0x23 && codePoint <= 0x5B) ||
             (codePoint >= 0x5D && codePoint <= 0x10FFFF);
    };

    const parseEscaped = (): string => {
      const isQuoute = (char: string | null): char is '"' => char === '"';
      const isSlash = (char: string | null): char is '/' => char === '/';
      const isBackspace = (char: string | null): char is '\b' => char === '\b';
      const isFormFeed = (char: string | null): char is '\f' => char === '\f';
      const isLineFeed = (char: string | null): char is '\n' => char === '\n';
      const isCarriageReturn = (char: string | null): char is '\r' => char === '\r';
      const isTab = (char: string | null): char is '\t' => char === '\t';
      const isU = (char: string | null): char is 'u' => char === 'u';
      const isHexCharacter = (char: string | null): char is string => {
        if (char === null) {
          return false;
        }
        return /^[0-9A-Fa-f]$/.test(char);
      };

      if (this.walker.match(isQuoute)) {
        return '"';
      } else if (this.walker.match(isBackslash)) {
        return '\\';
      } else if (this.walker.match(isSlash)) {
        return '/';
      } else if (this.walker.match(isBackspace)) {
        return '\b';
      } else if (this.walker.match(isFormFeed)) {
        return '\f';
      } else if (this.walker.match(isLineFeed)) {
        return '\n';
      } else if (this.walker.match(isCarriageReturn)) {
        return '\r';
      } else if (this.walker.match(isTab)) {
        return '\t';
      }
      this.walker.consume(isU, 'Invalid escape sequence, expected escapable character at position ' + this.walker.getCurrentPosition() + 1);
      let hex = '';
      // Now let's read 4 hexadecimal digits
      for (let i = 0; i < 4; i++) {
        const hexChar = this.walker.consume(isHexCharacter, 'Invalid escape sequence, expected hexadecimal digit at position ' + this.walker.getCurrentPosition() + 1);
        hex += hexChar;
      }
      return String.fromCharCode(parseInt(hex, 16));
    };

    while (this.walker.peak() !== '"' && !this.walker.isAtEnd()) {
      if (this.walker.match(isBackslash)) {
        if (this.walker.isAtEnd()) break;
        value += parseEscaped();
      } else {
        value += this.walker.consume(isStringCharacter, 'Invalid string character at position ' + this.walker.getCurrentPosition());
      }
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
