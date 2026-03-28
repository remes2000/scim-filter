import { CompareLogicalOperator, IdentifierToken, Operator, ValueToken } from "../lexer/types.js";

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
  filter: Filter;
}

interface LogicalExpression {
  operator: CompareLogicalOperator;
  left: Filter;
  right: Filter;
}

interface NotExpression {
  operator: 'not';
  filter: Filter;
}
