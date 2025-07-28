import { IdentifierToken, LogicalOperator, OperatorToken, ValueToken } from "../lexer/types";

export type Expression = 
  | AttributeExpression
  | LogicalExpression
  | ValuePathExpression
  | NotExpression;

export type AttributeExpression =
  | ComparisionAttributeExpression
  | UnaryAttributeExpression;

interface ComparisionAttributeExpression {
  identifier: IdentifierToken['value'];
  operator: OperatorToken['value'];
  value: ValueToken['value'];
}

interface UnaryAttributeExpression {
  identifier: IdentifierToken['value'];
  operator: 'pr';
}

interface ValuePathExpression {
  identifier: IdentifierToken['value'];
  expression: Expression;
}

export interface LogicalExpression {
  left: Expression;
  operator: LogicalOperator;
  right: Expression;
};

export interface NotExpression {
  operator: 'not',
  right: Expression;
}
