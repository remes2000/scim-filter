type LexerState = 'filter' | 'operator' | 'value' | 'stringValue' | 'logicalOperator' | 'ignoreSpace'

type Token = IdentifierToken | StringValueToken | BooleanValueToken | NumberValueToken | NullValueToken | OperatorToken | LogicalOperatorToken | EOTToken | OpenParenthesis | CloseParenthesis;
type Operator = 'eq' | 'ne' | 'co' | 'sw' | 'ew' | 'pr' | 'gt' | 'ge' | 'lt' | 'le';
type LogicalOperator = 'and' | 'or' | 'not';

// TODO: call those COMPARE_OPERATORS
const VALUE_REQUIRED_OPERATORS = ['eq', 'ne', 'co', 'sw', 'ew', 'gt', 'ge', 'lt', 'le'];
const NO_VALUE_OPERATORS = ['pr'];
const OPERATORS = [...VALUE_REQUIRED_OPERATORS, ...NO_VALUE_OPERATORS];
const isOperator = (value: string): value is Operator => OPERATORS.includes(value);
const LOGICAL_OPERATORS = ['and', 'or', 'not'];
const isLogicalOperator = (value: string): value is LogicalOperator => LOGICAL_OPERATORS.includes(value);
const SP = ' ';
const QUOTE = '"';

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
  value: number;
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

interface EOTToken {
  type: 'EOT';
}

class Lexer {
  private state: State = new FilterState([]);

  constructor(private readonly input: string) { }

  parse(): Token[] {
    [...this.input.split(''), null].forEach((char) => {
      this.state = this.state.handle(char);
      console.log(this.state.tokens);
    });
    return [...this.state.tokens, { type: 'EOT' }];
  }
}

interface State {
  handle: (char: string | null) => State;
  readonly tokens: Token[];
}

class FilterState implements State {  
  private memory = '';

  constructor(readonly tokens: Token[]) {};

  handle(char: string | null) {
    if (char === SP || char === null) {
      this.tokens.push({ type: 'Identifier', value: this.memory });
      return new OperatorState(this.tokens);
    }
    if (char === '(') {
      this.tokens.push({ type: 'OpenParenthesis', value: '(' });
      return new FilterState(this.tokens);
    }
    if (char === ')') {
      this.tokens.push({ type: 'CloseParenthesis', value: ')' });
      return new LogicalOperatorState(this.tokens);
    }
    this.memory += char;
    return this;
  }
}

class OperatorState implements State {
  private memory: string = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null) {
    if (char === SP || char === null) {
      const operator = this.memory;
      if (!isOperator(operator)) {
        throw new Error(`${this.memory} is not a valid operator`);
      }

      this.tokens.push({ type: 'Operator', value: operator });
      return VALUE_REQUIRED_OPERATORS.includes(operator) ? new ValueState(this.tokens) : new LogicalOperatorState(this.tokens);
    }

    this.memory += char;
    return this;
  }
}

class ValueState implements State {
  private memory: string = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null) {
    if (char === SP || char === null) {
      /* TODO: handle nulls and booleans */
      return new LogicalOperatorState(this.tokens);
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

  handle(char: string | null) {
    if (char === QUOTE && this.memory.slice(-1) !== '\\') {
      // TODO: I think I should replace escaped quotes with only a quote
      this.tokens.push({ type: 'String', value: this.memory });
      return new LogicalOperatorState(this.tokens);
    } else if (char === null) {
      /* TODO: add better error type */
      throw new Error('Unterminated string literal');
    } else {
      this.memory += char;
      return this;
    }
  }
}

class LogicalOperatorState implements State {
  private memory = '';

  constructor(readonly tokens: Token[]) {}

  handle(char: string | null) {
    if (char === null) {
      if (this.memory === '') {
        // End of input :)
        return this;
      }
      // TODO: Define good error type
      throw new Error(`Unexpected end of input, expected logical operator, got ${this.memory}`);
    }

    if (char === SP) {
      if (this.memory === '') {
        // Ignore space, how can I detect multiple spaces? TODO
        return this;
      }

      const operator = this.memory;
      if (!isLogicalOperator(operator)) {
        // TODO: Define good error type
        throw new Error(`${operator} is not a valid logical operator`);
      }
      this.tokens.push({ type: 'LogicalOperator', value: operator });
      return new FilterState(this.tokens);
    }

    if (char === ')') {
      if (this.memory === '') {
        this.tokens.push({ type: 'CloseParenthesis', value: ')' });
        return new LogicalOperatorState(this.tokens);
      }
    }

    this.memory += char;
    return this;
  }
}

export {
  Lexer,
  Token
};