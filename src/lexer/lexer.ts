type LexerState = 'start' | 'operator' | 'value' | 'stringValue' | 'logicalOperator';

type Token = IdentifierToken | StringValueToken | BooleanValueToken | NumberValueToken | NullValueToken | OperatorToken | LogicalOperatorToken | EOTToken | OpenParenthesis | CloseParenthesis;
type Operator = 'eq' | 'ne' | 'co' | 'sw' | 'ew' | 'pr' | 'gt' | 'ge' | 'lt' | 'le';
type LogicalOperator = 'and' | 'or' | 'not';

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
  private currentState: LexerState = 'start';
  private currentChar: string | null = null;
  private memory: string = '';
  private readonly tokens: Token[] = [];

  constructor(private readonly input: string) {}

  parse(): Token[] {
    [ ...this.input.split(''), null ].forEach((char) => {
      this.currentChar = char;
      if (this.currentState === 'start') {
        this.handleStart();
      } else if (this.currentState === 'operator') {
        this.handleOperator();
      } else if (this.currentState === 'value') {
        this.handleValue();
      } else if (this.currentState === 'stringValue') {
        this.handleStringValue()
      }
      else if (this.currentState === 'logicalOperator') {
        this.handleLogicalOperator();
      }
    });
    return [...this.tokens, { type: 'EOT' }];
  }

  private setState(newState: LexerState) {
    this.currentState = newState;
    this.memory = '';
  }

  private handleStart() {
    /* TODO: For now I've wrongly assumed that it has to start with an indentifier */
    if (this.currentChar === SP || this.currentChar === null) {
      /* TODO: verify that identifier is a valid value */
      this.tokens.push({ type: 'Identifier', value: this.memory });
      this.setState('operator');
    } else {
      this.memory += this.currentChar;
    }
  }

  private handleOperator() {
    if (this.currentChar === SP || this.currentChar === null) {
      const operator = this.memory;
      if (!isOperator(operator)) {
        /* TODO: Define good error type */
        throw new Error(`${this.memory} is not a valid operator`);
      }
      this.tokens.push({ type: 'Operator', value: operator });
      if (VALUE_REQUIRED_OPERATORS.includes(operator)) {
        this.setState('value');
      } else {
        this.setState('logicalOperator');
      }
    } else {
      this.memory += this.currentChar;
    }
  }

  private handleValue() {
    if (this.currentChar === SP || this.currentChar === null) {
      /* TODO: handle nulls and booleans */
      this.setState('logicalOperator');
    } if (this.memory === '' && this.currentChar === QUOTE) {
      this.setState('stringValue');
    } else {
      this.memory += this.currentChar;
    }
  }

  private handleStringValue() {
    if (this.currentChar === QUOTE && this.memory.slice(-1) !== '\\') {
      // TODO: I think I should replace escaped quotes with only a quote
      this.tokens.push({ type: 'String', value: this.memory });
      this.setState('logicalOperator');
    } else if (this.currentChar === null) {
      /* TODO: add better error type */
      throw new Error('Unterminated string literal');
    } else {
      this.memory += this.currentChar;
    }
  }

  private handleLogicalOperator() {
    if (this.currentChar === null) {
      if (this.memory !== '') {
        /* TODO: add better types for errors */
        throw new Error('Unexpected end of input while parsing logical operator');
      } else {
        return;
      }
    }
    if (this.currentChar === SP) {
      const operator = this.memory;
      if (!isLogicalOperator(operator)) {
        // TODO: Define good error type
        throw new Error(`${operator} is not a valid logical operator`);
      }
      this.tokens.push({ type: 'LogicalOperator', value: operator });
      /* TODO: it should not be start */
      this.setState('start');
    } else {
      this.memory += this.currentChar;
    }
  }
}

export {
  Lexer,
  Token
};