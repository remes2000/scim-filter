import { CompareLogicalOperator, IdentifierToken, Operator, ValueToken } from "../lexer/types";

export type Filter = 
  | AttributeExpression
  | LogicalExpression
  | ValuePathExpression
  | NotExpression;

type AttributeExpression =
  | ComparisionAttributeExpression
  | UnaryAttributeExpression;

interface UnaryAttributeExpression {
  attribute: IdentifierToken['value'];
  operator: 'pr';
}

interface ComparisionAttributeExpression {
  attribute: IdentifierToken['value'];
  operator: Exclude<Operator, 'pr'>;
  value: ValueToken['value'];
}

interface ValuePathExpression {
  attribute: IdentifierToken['value'];
  operator: 'valuePath';
  filters: [Filter]
}

interface LogicalExpression {
  operator: CompareLogicalOperator;
  filters: [Filter, Filter];
}

interface NotExpression {
  operator: 'not';
  filters: [Filter];
}
