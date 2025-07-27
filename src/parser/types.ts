import { IdentifierToken, LogicalOperator, OperatorToken, ValueToken } from "../lexer/types";

export type Expression = 
  | AttributeExpression
  | LogicalExpression
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

export interface LogicalExpression {
  left: Expression;
  operator: LogicalOperator;
  right: Expression;
};

export interface NotExpression {
  operator: 'not',
  right: Expression;
}
