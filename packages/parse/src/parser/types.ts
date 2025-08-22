import { CompareLogicalOperator, IdentifierToken, Operator, ValueToken } from "../lexer/types";

type Attribute = Array<IdentifierToken['value']>;

export type Filter = 
  | AttributeExpression
  | LogicalExpression
  | ValuePathExpression
  | NotExpression;

type AttributeExpression =
  | ComparisionAttributeExpression
  | UnaryAttributeExpression;

interface UnaryAttributeExpression {
  attribute: Attribute;
  operator: 'pr';
}

interface ComparisionAttributeExpression {
  attribute: Attribute;
  operator: Exclude<Operator, 'pr'>;
  value: ValueToken['value'];
}

interface ValuePathExpression {
  attribute: Attribute;
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
