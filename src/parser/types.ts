import { IdentifierToken, LogicalOperator, OperatorToken, ValueToken } from "../lexer/types";

export type Expression = 
  | AttributeExpression
  | LogicalExpression;

export interface AttributeExpression {
  identifier: IdentifierToken['value']
  operator: OperatorToken['value'];
  value: ValueToken['value'];
};

export interface LogicalExpression {
  left: Expression;
  operator: LogicalOperator;
  right: Expression;
};
