import { ScimFilterError } from '../errors';

type CheckPredicate<T, S extends T = T> = (symbol: T) => symbol is S;

export class Walker<T> {
  private position = 0;
  constructor(private readonly symbols: T[]) {
  }

  consume<S extends T>(predicate: CheckPredicate<T, S>, errorMessage: string): S {
    const element = this.peak();
    if (element === null) {
      throw new ScimFilterError(errorMessage);
    }
    if (predicate(element)) {
      this.advance();
      return element;
    }
    throw new ScimFilterError(errorMessage);
  }

  match(predicate: CheckPredicate<T>): boolean {
    if (this.check(predicate)) {
      this.advance();
      return true;
    }
    return false;
  }

  advance(): T | null {
    if (this.isAtEnd()) {
      return null;
    }
    this.position++;
    return this.previous();
  }

  // Non modyfying state methods

  check(predicate: CheckPredicate<T>): boolean {
    const currentElement = this.peak();
    if (currentElement === null) {
      return false;
    }
    return predicate(currentElement);
  }

  peak(): T | null {
    if (this.isAtEnd()) return null;
    return this.symbols[this.position];
  }

  previous(): T | null {
    if (this.isAtStart()) {
      return null;
    }
    return this.symbols[this.position - 1];
  }

  isAtStart(): boolean {
    return this.position === 0;
  }

  isAtEnd(): boolean {
    return this.position >= this.symbols.length;
  }

  getCurrentPosition(): number {
    return this.position;
  }
}
