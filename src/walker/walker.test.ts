import { describe, expect, it } from 'vitest';
import { Walker } from './walker';

describe('Walker', () => {
  describe('constructor', () => {
    it('should create a walker with valid symbols', () => {
      const walker = new Walker(['a', 'b', 'c']);
      expect(walker.peak()).toBe('a');
    });
  });

  describe('peak', () => {
    it('should return current symbol without advancing', () => {
      const walker = new Walker(['a', 'b', 'c']);
      expect(walker.peak()).toBe('a');
      expect(walker.peak()).toBe('a'); // Should not advance
    });

    it('should return null when at end', () => {
      const walker = new Walker(['a']);
      walker.advance();
      expect(walker.peak()).toBeNull();
    });
  });

  describe('advance', () => {
    it('should advance position and return previous symbol', () => {
      const walker = new Walker(['a', 'b', 'c']);
      const result = walker.advance();
      expect(result).toBe('a');
      expect(walker.peak()).toBe('b');
    });

    it('should not advance beyond last symbol', () => {
      const walker = new Walker(['a']);
      const result = walker.advance();
      expect(result).toBe('a');
      expect(walker.peak()).toBeNull();
      expect(walker.advance()).toBeNull();
    });
  });

  describe('previous', () => {
    it('should return null at start', () => {
      const walker = new Walker(['a', 'b', 'c']);
      expect(walker.previous()).toBeNull();
    });

    it('should return previous symbol after advancing', () => {
      const walker = new Walker(['a', 'b', 'c']);
      walker.advance();
      expect(walker.previous()).toBe('a');
    });
  });

  describe('check', () => {
    it('should return true when predicate matches current symbol', () => {
      const walker = new Walker(['a', 'b', 'c']);
      const isA = (symbol: string): symbol is 'a' => symbol === 'a';
      expect(walker.check(isA)).toBe(true);
    });

    it('should return false when predicate does not match', () => {
      const walker = new Walker(['a', 'b', 'c']);
      const isB = (symbol: string): symbol is 'b' => symbol === 'b';
      expect(walker.check(isB)).toBe(false);
    });

    it('should always return false at end', () => {
      const walker = new Walker(['a']);
      walker.advance();
      const isA = (symbol: string): symbol is 'a' => symbol === 'a';
      expect(walker.check(isA)).toBe(false);
    });
  });

  describe('match', () => {
    it('should advance and return true when predicate matches', () => {
      const walker = new Walker(['a', 'b', 'c']);
      const isA = (symbol: string): symbol is 'a' => symbol === 'a';
      expect(walker.match(isA)).toBe(true);
      expect(walker.peak()).toBe('b');
    });

    it('should not advance and return false when predicate does not match', () => {
      const walker = new Walker(['a', 'b', 'c']);
      const isB = (symbol: string): symbol is 'b' => symbol === 'b';
      expect(walker.match(isB)).toBe(false);
      expect(walker.peak()).toBe('a');
    });

    it('should not advance and return false at end', () => {
      const walker = new Walker(['a']);
      walker.advance();
      const isA = (symbol: string): symbol is 'a' => symbol === 'a';
      expect(walker.match(isA)).toBe(false);
      expect(walker.peak()).toBeNull();
    });
  });

  describe('consume', () => {
    it('should advance and return symbol when predicate matches', () => {
      const walker = new Walker(['a', 'b', 'c']);
      const isA = (symbol: string): symbol is 'a' => symbol === 'a';
      const result = walker.consume(isA, 'Expected a');
      expect(result).toBe('a');
      expect(walker.peak()).toBe('b');
    });

    it('should throw error when predicate does not match', () => {
      const walker = new Walker(['a', 'b', 'c']);
      const isB = (symbol: string): symbol is 'b' => symbol === 'b';
      expect(() => walker.consume(isB, 'Expected b')).toThrow('Expected b');
      expect(walker.peak()).toBe('a'); // Should not advance
    });

    it('should throw error when at end', () => {
      const walker = new Walker(['a']);
      walker.advance();
      const isA = (symbol: string): symbol is 'a' => symbol === 'a';
      expect(() => walker.consume(isA, 'Expected a')).toThrow('Expected a');
      expect(walker.peak()).toBeNull();
    });
  });

  describe('type safety', () => {
    it('should work with different types', () => {
      interface Token { type: string; value: string; }
      
      const tokens: Token[] = [
        { type: 'NUMBER', value: '42' },
        { type: 'OPERATOR', value: '+' },
        { type: 'NUMBER', value: '10' }
      ];
      
      const walker = new Walker(tokens);
      const isNumber = (token: Token): token is { type: 'NUMBER', value: string } => token.type === 'NUMBER';
      
      expect(walker.check(isNumber)).toBe(true);
      const numberToken = walker.consume(isNumber, 'Expected number');
      expect(numberToken.value).toBe('42');
    });
  });
});
