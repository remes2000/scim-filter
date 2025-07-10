import { COMPARE_LOGICAL_OPERATORS, OPERATORS } from "./constants";

export class LexerError extends Error {
  constructor(message: string, public readonly position?: number) {
    super(message);
    this.name = 'LexerError';
  }
}

export class InvalidOperatorError extends LexerError {
  constructor(operator: string, position?: number) {
    const message = `'${operator}' is not a valid operator. Expected one of: ${OPERATORS.join(', ')}`;
    super(message, position);
  }
}

export class InvalidValueError extends LexerError {
  constructor(value: string, position: number) {
    const message = `'${value}' is not a valid value. Expected a string (quoted), boolean (true/false), null, or number`;
    super(message, position);
  }
}

export class UnterminatedStringError extends LexerError {
  constructor(position: number) {
    super('Unterminated string literal. Expected closing quote', position);
  }
}

export class InvalidCompareLogicalOperator extends LexerError {
  constructor(operator: string, position: number) {
    const message = `'${operator}' is not a valid logical operator. Expected one of: ${COMPARE_LOGICAL_OPERATORS.join(', ')}`;
    super(message, position);
  }
}

export class MissingParenthesisAfterNotError extends LexerError {
  constructor(char: string | null, position: number) {
    const message = `Expected '(' after 'not' operator, got '${char}'`;
    super(message, position);
  }
}

export class UnexpectedEndOfInputError extends LexerError {
  constructor(position: number) {
    const message = `Unexpected end of input`;
    super(message, position);
  }
}
