type Token = IdentifierToken | StringValueToken | BooleanValueToken | NumberValueToken | NullValueToken | OperatorToken | LogicalOperatorToken | EOTToken | OpenParenthesis | CloseParenthesis | OpenSquareParenthesis | CloseSquareParenthesis;
type Operator = 'eq' | 'ne' | 'co' | 'sw' | 'ew' | 'pr' | 'gt' | 'ge' | 'lt' | 'le';
type CompareLogicalOperator = 'and' | 'or';
type LogicalOperator = CompareLogicalOperator | 'not';

// TODO: call those COMPARE_OPERATORS
const VALUE_REQUIRED_OPERATORS = ['eq', 'ne', 'co', 'sw', 'ew', 'gt', 'ge', 'lt', 'le'];
const NO_VALUE_OPERATORS = ['pr'];
const OPERATORS = [...VALUE_REQUIRED_OPERATORS, ...NO_VALUE_OPERATORS];
const isOperator = (value: string): value is Operator => OPERATORS.includes(value);
const COMPARE_LOGICAL_OPERATORS = ['and', 'or'];
const NEGATION_LOGICAL_OPERATOR = 'not';
const isCompareLogicalOperator = (value: string): value is CompareLogicalOperator => COMPARE_LOGICAL_OPERATORS.includes(value);
const SP = ' ';
const QUOTE = '"';

enum LexerErrorType {
  INVALID_OPERATOR = 'INVALID_OPERATOR',
  INVALID_VALUE = 'INVALID_VALUE',
  UNTERMINATED_STRING = 'UNTERMINATED_STRING',
  INVALID_LOGICAL_OPERATOR = 'INVALID_LOGICAL_OPERATOR',
  MISSING_PARENTHESIS_AFTER_NOT = 'MISSING_PARENTHESIS_AFTER_NOT',
  UNEXPECTED_END_OF_INPUT = 'UNEXPECTED_END_OF_INPUT'
}

class LexerError extends Error {
  constructor(
    public readonly errorType: LexerErrorType,
    message: string,
    public readonly position?: number,
    public readonly token?: string,
    public readonly expected?: string[]
  ) {
    super(message);
    this.name = 'LexerError';
  }
}

class InvalidOperatorError extends LexerError {
  constructor(operator: string, position?: number) {
    super(
      LexerErrorType.INVALID_OPERATOR,
      `'${operator}' is not a valid operator. Expected one of: ${OPERATORS.join(', ')}`,
      position,
      operator,
      OPERATORS
    );
  }
}

class InvalidValueError extends LexerError {
  constructor(value: string, position?: number) {
    super(
      LexerErrorType.INVALID_VALUE,
      `'${value}' is not a valid value. Expected a string (quoted), boolean (true/false), null, or number`,
      position,
      value,
      ['string', 'true', 'false', 'null', 'number']
    );
  }
}

class UnterminatedStringError extends LexerError {
  constructor(position?: number) {
    super(
      LexerErrorType.UNTERMINATED_STRING,
      'Unterminated string literal. Expected closing quote',
      position
    );
  }
}

class InvalidLogicalOperatorError extends LexerError {
  constructor(operator: string, position?: number) {
    super(
      LexerErrorType.INVALID_LOGICAL_OPERATOR,
      `'${operator}' is not a valid logical operator. Expected one of: ${COMPARE_LOGICAL_OPERATORS.join(', ')}`,
      position,
      operator,
      COMPARE_LOGICAL_OPERATORS
    );
  }
}

class MissingParenthesisAfterNotError extends LexerError {
  constructor(char: string | null, position?: number) {
    super(
      LexerErrorType.MISSING_PARENTHESIS_AFTER_NOT,
      `Expected '(' after 'not' operator, got '${char}'`,
      position,
      char || 'null',
      ['(']
    );
  }
}

class UnexpectedEndOfInputError extends LexerError {
  constructor(memory: string, position?: number) {
    super(
      LexerErrorType.UNEXPECTED_END_OF_INPUT,
      `Unexpected end of input, expected logical operator, got '${memory}'`,
      position,
      memory,
      COMPARE_LOGICAL_OPERATORS
    );
  }
}

interface IdentifierToken {
  type: 'Identifier';
  value: string;
}

interface StringValueToken {
  type: 'String';
  value: string;
}

interface BooleanValueToken {
  type: 'Boolean',
  value: boolean;
}

interface NumberValueToken {
  type: 'Number';
  value: string;
}

interface NullValueToken {
  type: 'Null';
  value: null;
}

interface OperatorToken {
  type: 'Operator';
  value: Operator;
}

interface LogicalOperatorToken {
  type: 'LogicalOperator';
  value: LogicalOperator;
}

/* TODO: maybe one token will be enough */
interface OpenParenthesis {
  type: 'OpenParenthesis';
  value: '(';
}

interface CloseParenthesis {
  type: 'CloseParenthesis';
  value: ')';
}

interface OpenSquareParenthesis {
  type: 'OpenSquareParenthesis';
  value: '[';
}

interface CloseSquareParenthesis {
  type: 'CloseSquareParenthesis';
  value: ']';
}

interface EOTToken {
  type: 'EOT';
}

class Lexer {
  private state: State = new FilterState([]);
  private position: number = 0;

  constructor(private readonly input: string) { }

  parse(): Token[] {
    [...this.input.split(''), null].forEach((char) => {
      this.state = this.state.handle(char, this.position);
      this.position++;
    });
    return [...this.state.tokens, { type: 'EOT' }];
  }
}

interface State {
  handle: (char: string | null, position: number) => State;
  readonly tokens: Token[];
}

class FilterState implements State {  
  private memory = '';

  constructor(readonly tokens: Token[]) {};

  handle(char: string | null, position: number): State {
    if (char === SP || char === null) {
      if (this.memory === NEGATION_LOGICAL_OPERATOR) {
        this.tokens.push({ type: 'LogicalOperator', value: this.memory });
        return new ParenthesisAfterNegationState(this.tokens);
      }
      this.tokens.push({ type: 'Identifier', value: this.memory });
      return new OperatorState(this.tokens);
    }
    if (char === '[') {
      this.tokens.push({ type: 'Identifier', value: this.memory });
      this.tokens.push({ type: 'OpenSquareParenthesis', value: '[' });
      return new FilterState(this.tokens);
    }
    if (char === '(') {
      if (this.memory === NEGATION_LOGICAL_OPERATOR) {
        this.tokens.push({ type: 'LogicalOperator', value: this.memory });
        this.tokens.push({ type: 'OpenParenthesis', value: '(' });
        return new FilterState(this.tokens);
      }

      this.tokens.push({ type: 'OpenParenthesis', value: '(' });
      return new FilterState(this.tokens);
    }
    this.memory += char;
    return this;
  }
}

class OperatorState implements State {
  private memory: string = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null, position: number): State {
    if (char === SP || char === null) {
      const operator = this.memory;
      if (!isOperator(operator)) {
        throw new InvalidOperatorError(this.memory, position);
      }

      this.tokens.push({ type: 'Operator', value: operator });
      return VALUE_REQUIRED_OPERATORS.includes(operator) ? new ValueState(this.tokens) : new CompareLogicalOperatorState(this.tokens);
    }

    this.memory += char;
    return this;
  }
}

class ValueState implements State {
  private memory: string = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null, position: number): State {
    if (char === SP || char === null) {
      if (this.memory === 'true') {
        this.tokens.push({ type: 'Boolean', value: true });
      } else if (this.memory === 'false') {
        this.tokens.push({ type: 'Boolean', value: false });
      } else if (this.memory === 'null') {
        this.tokens.push({ type: 'Null', value: null });
      } else if (!isNaN(Number(this.memory))) {
        // TODO: Handle the number according to the protocol. Allow everything that JSON does.
        this.tokens.push({ type: 'Number', value: this.memory });
      } else {
        throw new InvalidValueError(this.memory, position);
      }
      return new CompareLogicalOperatorState(this.tokens);
    } if (this.memory === '' && char === QUOTE) {
      return new StringValueState(this.tokens);
    } else {
      this.memory += char;
      return this;
    }
  }
}

class StringValueState implements State {
  private memory: string = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null, position: number): State {
    if (char === QUOTE && this.memory.slice(-1) !== '\\') {
      // TODO: I think I should replace escaped quotes with only a quote
      this.tokens.push({ type: 'String', value: this.memory });
      return new CompareLogicalOperatorState(this.tokens);
    } else if (char === null) {
      throw new UnterminatedStringError(position);
    } else {
      this.memory += char;
      return this;
    }
  }
}

class CompareLogicalOperatorState implements State {
  private memory = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null, position: number): State {
    if (char === null) {
      if (this.memory === '') {
        // End of input :)
        return this;
      }
      throw new UnexpectedEndOfInputError(this.memory, position);
    }

    if (char === SP) {
      if (this.memory === '') {
        // Ignore space, how can I detect multiple spaces? TODO
        return this;
      }

      const operator = this.memory;
      if (!isCompareLogicalOperator(operator)) {
        throw new InvalidLogicalOperatorError(operator, position);
      }
      this.tokens.push({ type: 'LogicalOperator', value: operator });
      return new FilterState(this.tokens);
    }

    if (char === ')') {
      if (this.memory === '') {
        this.tokens.push({ type: 'CloseParenthesis', value: ')' });
        return new CompareLogicalOperatorState(this.tokens);
      }
    }

    if (char === ']') {
      if (this.memory === '') {
        this.tokens.push({ type: 'CloseSquareParenthesis', value: ']' });
        return new CompareLogicalOperatorState(this.tokens);
      }
    }

    this.memory += char;
    return this;
  }
}

class ParenthesisAfterNegationState implements State {
  constructor(readonly tokens: Token[]) {}

  handle(char: string | null, position: number): State {
    if (char === '(') {
      this.tokens.push({ type: 'OpenParenthesis', value: '(' });
      return new FilterState(this.tokens);
    }
    throw new MissingParenthesisAfterNotError(char, position);
  }
}

export {
  Lexer,
  Token,
  LexerError,
  LexerErrorType,
  InvalidOperatorError,
  InvalidValueError,
  UnterminatedStringError,
  InvalidLogicalOperatorError,
  MissingParenthesisAfterNotError,
  UnexpectedEndOfInputError
};