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

const isOperator = (value: string): value is Operator => OPERATORS.includes(value);
const isLogicalOperator = (value: string): value is LogicalOperator => LOGICAL_OPERATORS.includes(value);

export class Lexer {
  private state: State = new DefaultState([]);

  constructor(private readonly input: string) { }

  parse(): Token[] {
    [...this.input.split(''), null].forEach((char) => {
      this.state = this.state.handle(char);
    });
    return [...this.state.tokens, { type: 'EOT' }];
  }
}

interface State {
  handle: (char: string | null) => State;
  readonly tokens: Token[];
}

class DefaultState implements State {
  private memory = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null) {
    if (char === '(') {
      this.tokens.push({ type: 'OpenParenthesis', value: '(' });
      return new DefaultState(this.tokens);
    }
    if (char === ')') {
      this.tokens.push({ type: 'CloseParenthesis', value: ')' });
      return new DefaultState(this.tokens);
    }
    if (char === '[') {
      this.tokens.push({ type: 'OpenSquareParenthesis', value: '[' });
      return new DefaultState(this.tokens);
    }
    if (char === ']') {
      this.tokens.push({ type: 'CloseSquareParenthesis', value: ']' });
      return new DefaultState(this.tokens); 
    }
    if (char === ' ') {
      return new DefaultState(this.tokens);
    }
    if (char === '"') {
      return new StringState(this.tokens);
    }
    if (char === '.') {
      this.tokens.push({ type: 'Dot', value: '.' });
      return new DefaultState(this.tokens);
    }
    if (isDigit(char)) {
      return new NumberState(char, this.tokens);
    }
    if (isAlpha(char)) {
      return new IdentifierState(char, this.tokens);
    }
    if (char === null) {
      return this;
    }

    // TODO: add error type, add position
    throw 'Invalid character: ' + char;
  }
}

class IdentifierState implements State {
  private memory: string;

  constructor(
    consumedCharacters: string,
    readonly tokens: Token[]
  ) {
    this.memory = consumedCharacters;
  }

  handle(char: string | null): State {
    if (isAlpha(char) || isDigit(char) || char === '_' || char === '-') { 
      this.memory += char
      return this;
    }
    if (isOperator(this.memory)) {
      this.tokens.push({ type: 'Operator', value: this.memory });
      return new DefaultState(this.tokens);
    }
    if (isLogicalOperator(this.memory)) {
      this.tokens.push({ type: 'LogicalOperator', value: this.memory });
      if (this.memory === 'not' && char === '(') {
        this.tokens.push({ type: 'OpenParenthesis', value: '(' });
      }
      return new DefaultState(this.tokens);
    }
    if (this.memory === 'true' || this.memory === 'false') {
      this.tokens.push({ type: 'Boolean', value: this.memory === 'true' });
      return new DefaultState(this.tokens);
    }
    if (this.memory === 'null') {
      this.tokens.push({ type: 'Null', value: null });
      return new DefaultState(this.tokens);
    }
    this.tokens.push({ type: 'Identifier', value: this.memory });
    if (char === '.') {
      this.tokens.push({ type: 'Dot', value: '.' });
    }
    if (char === '[') {
      this.tokens.push({ type: 'OpenSquareParenthesis', value: '[' });
    }
    return new DefaultState(this.tokens);
  }
}

class StringState implements State {
  private memory = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null): State {
    if (char === '"' && this.memory.slice(-1) !== '\\') {
      this.tokens.push({ type: 'String', value: this.memory });
      return new DefaultState(this.tokens);
    }
    if (char === null) {
      // TODO: add error type, add position
      throw 'Unterminated string literal';
    }
    this.memory += char;
    return this;
  }
}

class NumberState implements State {
  private memory = '';

  constructor(
    consumedCharacters: string,
    readonly tokens: Token[]
  ) {
    this.memory = consumedCharacters;
  }

  handle(char: string | null): State {
    // TODO: handle decimal numbers, more complex numbers with scientific notation
    if (isDigit(char)) {
      this.memory += char;
      return this;
    }
    this.tokens.push({ type: 'Number', value: this.memory });
    return new DefaultState(this.tokens);
  }
}
