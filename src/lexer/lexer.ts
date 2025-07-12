import { Operator, CompareLogicalOperator, Token } from './types';
import { COMPARE_LOGICAL_OPERATORS, COMPARE_OPERATORS, NEGATION_LOGICAL_OPERATOR, OPERATORS, QUOTE, SP } from './constants';
import { InvalidCompareLogicalOperator, InvalidOperatorError, InvalidValueError, MissingParenthesisAfterNotError, UnexpectedEndOfInputError, UnterminatedStringError } from './errors';

const isOperator = (value: string): value is Operator => OPERATORS.includes(value);
const isCompareLogicalOperator = (value: string): value is CompareLogicalOperator => COMPARE_LOGICAL_OPERATORS.includes(value);

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
    /* TODO: throw on empty string */
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
        throw new InvalidOperatorError(this.memory, position - this.memory.length);
      }

      this.tokens.push({ type: 'Operator', value: operator });
      return COMPARE_OPERATORS.includes(operator) ? new ValueState(this.tokens) : new CompareLogicalOperatorState(this.tokens);
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
        throw new InvalidValueError(this.memory, position - this.memory.length);
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
      throw new UnterminatedStringError(position - this.memory.length - 1);
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
      throw new UnexpectedEndOfInputError(position);
    }

    if (char === SP) {
      if (this.memory === '') {
        // Ignore space, how can I detect multiple spaces? TODO
        return this;
      }

      const operator = this.memory;
      if (!isCompareLogicalOperator(operator)) {
        throw new InvalidCompareLogicalOperator(operator, position);
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
  Token
};