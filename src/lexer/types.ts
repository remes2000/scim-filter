export type Token = 
  | IdentifierToken 
  | StringValueToken 
  | BooleanValueToken 
  | NumberValueToken 
  | NullValueToken 
  | OperatorToken 
  | LogicalOperatorToken 
  | EOTToken 
  | OpenParenthesis 
  | CloseParenthesis 
  | OpenSquareParenthesis 
  | CloseSquareParenthesis;

export type Operator = 'eq' | 'ne' | 'co' | 'sw' | 'ew' | 'pr' | 'gt' | 'ge' | 'lt' | 'le';
export type CompareLogicalOperator = 'and' | 'or';
export type LogicalOperator = CompareLogicalOperator | 'not';

export interface IdentifierToken {
  type: 'Identifier';
  value: string;
}

export interface StringValueToken {
  type: 'String';
  value: string;
}

export interface BooleanValueToken {
  type: 'Boolean',
  value: boolean;
}

export interface NumberValueToken {
  type: 'Number';
  value: string;
}

export interface NullValueToken {
  type: 'Null';
  value: null;
}

export interface OperatorToken {
  type: 'Operator';
  value: Operator;
}

export interface LogicalOperatorToken {
  type: 'LogicalOperator';
  value: LogicalOperator;
}

export interface OpenParenthesis {
  type: 'OpenParenthesis';
  value: '(';
}

export interface CloseParenthesis {
  type: 'CloseParenthesis';
  value: ')';
}

export interface OpenSquareParenthesis {
  type: 'OpenSquareParenthesis';
  value: '[';
}

export interface CloseSquareParenthesis {
  type: 'CloseSquareParenthesis';
  value: ']';
}

export interface EOTToken {
  type: 'EOT';
}
