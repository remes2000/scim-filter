import { IdentifierToken, isCloseParenthesis, isCloseSquareParenthesis, isEOT, isIdentifier, isLogicalOperator, isOpenParenthesis, isOpenSquareParenthesis, isOperator, isValueToken, LogicalOperatorToken, Token } from "../lexer/types";
import { Filter } from "./types";

type PredicateFn<T extends Token = Token> = (token: Token) => token is T;

export class Parser {
  private current: number = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Filter {
    return this.orLogicalExpression();
  }

  orLogicalExpression(): Filter {
    let expression: Filter = this.andLogicalExpression();

    const orPredicate = (t: Token): t is IdentifierToken => isLogicalOperator(t) && t.value === 'or';
    if (this.match(orPredicate)) {
      const right = this.andLogicalExpression();
      expression = {
        operator: 'or',
        filters: [expression, right]
      };
    }

    return expression;
  }

  andLogicalExpression(): Filter {
    let expression: Filter = this.notLogicalExpression();

    const andPredicate = (t: Token): t is IdentifierToken => isLogicalOperator(t) && t.value === 'and';
    if (this.match(andPredicate)) {
      const right = this.notLogicalExpression();
      expression = {
        operator: 'and',
        filters: [expression, right]
      };
    }

    return expression;
  }

  notLogicalExpression(): Filter {
    const notPredicate = (t: Token): t is LogicalOperatorToken => isLogicalOperator(t) && t.value === 'not';
    if (this.match(notPredicate)) {
      const group = this.grouping();
      if (!group) {
        throw new Error('Expected group after "not" operator');
      }
      return {
        operator: 'not',
        filters: [group]
      };
    }

    return this.attributeExpression();
  }

  attributeExpression(): Filter {
    const grouping = this.grouping();
    if (grouping) {
      return grouping;
    }

    const { value: attribute } = this.consume(isIdentifier, 'Expected identifier');
    const valuePath = this.valuePath();
    if (valuePath) {
      return { attribute, operator: 'valuePath', filters: [valuePath] }
    }

    const { value: operator } = this.consume(isOperator, 'Expected operator');
    if (operator === 'pr') {
      return { attribute, operator: 'pr' };
    }
    const { value } = this.consume(isValueToken, 'Expected value');
    return { attribute, operator, value };
  }

  grouping(): Filter | null {
    if (this.match(isOpenParenthesis)) {
      const expression = this.parse();
      this.consume(isCloseParenthesis, 'Expected closing parenthesis');
      return expression;
    }
    return null;
  }

  valuePath(): Filter | null {
   if (this.match(isOpenSquareParenthesis)) {
    const expression = this.parse();
    this.consume(isCloseSquareParenthesis, 'Expected closing square parenthesis');
    return expression;
   }
   return null;
  }

  private match(predicate: PredicateFn) {
    if (this.check(predicate)) {
      this.advance();
      return true;
    }
    return false;
  }

  private advance<T extends Token>(): T {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private consume<T extends Token>(predicate: PredicateFn<T>, message: string): T {
    if (this.check(predicate)) {
      return this.advance<T>();
    }
    throw new Error(message);
  }

  private check<T extends Token>(predicate: PredicateFn<T>): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return predicate(this.peak());
  }

  private previous<T extends Token>(): T {
    if (this.current === 0) {
      // TODO: handle error
      throw new Error("No previous token available");
    }
    const token = this.tokens[this.current - 1];
    return token as T;
  }

  private isAtEnd() {
    return isEOT(this.peak());
  }

  private peak(): Token {
    return this.tokens[this.current];
  }
}
