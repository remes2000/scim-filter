export type TokenType = Token['type']

export type Token = 
  | IdentifierToken 
  | DotToken
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

export type ValueToken = 
  | StringValueToken 
  | BooleanValueToken 
  | NumberValueToken 
  | NullValueToken;

export type Operator = 'eq' | 'ne' | 'co' | 'sw' | 'ew' | 'pr' | 'gt' | 'ge' | 'lt' | 'le';
export type CompareLogicalOperator = 'and' | 'or';
export type LogicalOperator = CompareLogicalOperator | 'not';

export interface IdentifierToken {
  type: 'Identifier';
  value: string;
}

export interface DotToken {
  type: 'Dot';
  value: '.';
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

export const isIdentifier = (t: Token): t is IdentifierToken => t.type === 'Identifier';
export const isDot = (t: Token): t is DotToken => t.type === 'Dot';
export const isStringValue = (t: Token): t is StringValueToken => t.type === 'String';
export const isBooleanValue = (t: Token): t is BooleanValueToken => t.type === 'Boolean';
export const isNumberValue = (t: Token): t is NumberValueToken => t.type === 'Number';
export const isNullValue = (t: Token): t is NullValueToken => t.type === 'Null';
export const isValueToken = (t: Token): t is ValueToken => 
  isStringValue(t) || isBooleanValue(t) || isNumberValue(t) || isNullValue(t);
export const isOperator = (t: Token): t is OperatorToken => t.type === 'Operator';
export const isLogicalOperator = (t: Token): t is LogicalOperatorToken => t.type === 'LogicalOperator';
export const isOpenParenthesis = (t: Token): t is OpenParenthesis => t.type === 'OpenParenthesis';
export const isCloseParenthesis = (t: Token): t is CloseParenthesis => t.type === 'CloseParenthesis';
export const isOpenSquareParenthesis = (t: Token): t is OpenSquareParenthesis => t.type === 'OpenSquareParenthesis';
export const isCloseSquareParenthesis = (t: Token): t is CloseSquareParenthesis => t.type === 'CloseSquareParenthesis';
export const isEOT = (t: Token): t is EOTToken => t.type === 'EOT';
