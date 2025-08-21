import { DotToken, IdentifierToken, isCloseParenthesis, isCloseSquareParenthesis, isDot, isIdentifier, isLogicalOperator, isOpenParenthesis, isOpenSquareParenthesis, isOperator, isValueToken, LogicalOperatorToken, Token } from "../lexer/types";
import { Lexer } from "../lexer/lexer";
import { Walker } from "../walker/walker";
import { Filter } from "./types";
import { ScimFilterError } from "../errors";

export class Parser {
  private walker: Walker<Token>;

  constructor(input: string) {
    const lexer = new Lexer(input);
    const tokens = lexer.parse();
    this.walker = new Walker(tokens);
  }

  parse(): Filter {
    return this.orLogicalExpression();
  }

  orLogicalExpression(): Filter {
    const expression = this.andLogicalExpression();

    const orPredicate = (t: Token): t is IdentifierToken => isLogicalOperator(t) && t.value === 'or';
    if (this.walker.match(orPredicate)) {
      const right = this.andLogicalExpression();
      return { operator: 'or', filters: [ expression, right ] };
    }

    return expression;
  }

  andLogicalExpression(): Filter {
    const expression = this.notLogicalExpression();

    const andPredicate = (t: Token): t is IdentifierToken => isLogicalOperator(t) && t.value === 'and';
    if (this.walker.match(andPredicate)) {
      const right = this.notLogicalExpression();
      return { operator: 'and', filters: [expression, right] };
    }

    return expression;
  }

  notLogicalExpression(): Filter {
    const notPredicate = (t: Token): t is LogicalOperatorToken => isLogicalOperator(t) && t.value === 'not';
    if (this.walker.match(notPredicate)) {
      const group = this.grouping();
      if (!group) {
        throw new ScimFilterError('Expected group after "not" operator');
      }
      return { operator: 'not', filters: [group] };
    }

    return this.attributeExpression();
  }

  attributeExpression(): Filter {
    const grouping = this.grouping();
    if (grouping) {
      return grouping;
    }

    const attribute = this.attribute();
    const valuePath = this.valuePath();
    if (valuePath) {
      return { attribute, operator: 'valuePath', filters: [valuePath] }
    }

    const { value: operator } = this.walker.consume(isOperator, 'Expected operator');
    if (operator === 'pr') {
      return { attribute, operator: 'pr' };
    }
    const { value } = this.walker.consume(isValueToken, 'Expected value');
    return { attribute, operator, value };
  }

  grouping(): Filter | null {
    if (this.walker.match(isOpenParenthesis)) {
      const expression = this.parse();
      this.walker.consume(isCloseParenthesis, 'Expected closing parenthesis');
      return expression;
    }
    return null;
  }

  valuePath(): Filter | null {
   if (this.walker.match(isOpenSquareParenthesis)) {
    const expression = this.parse();
    this.walker.consume(isCloseSquareParenthesis, 'Expected closing square parenthesis');
    return expression;
   }
   return null;
  }

  attribute(): Array<IdentifierToken['value']> {
    const attribute: Array<IdentifierToken['value']> = [];
    do {
      const identifier = this.walker.consume(isIdentifier, 'Expected identifier');
      attribute.push(identifier.value);
    } while (this.walker.match(isDot));
    return attribute;
  }
}
