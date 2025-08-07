type CheckPredicate<T, S extends T = T> = (symbol: T) => symbol is S;

export class Walker<T> {
  private position = 0;
  constructor(private readonly symbols: T[]) {
    if (symbols.length === 0) {
      throw new Error('Walker requires at least one symbol');
    }
  }

  consume<S extends T>(predicate: CheckPredicate<T, S>, errorMessage: string): S {
    const element = this.peak();
    if (predicate(element)) {
      this.advance();
      return element;
    }
    throw new Error(errorMessage);
  }

  match(predicate: CheckPredicate<T>): boolean {
    if (this.check(predicate)) {
      this.advance();
      return true;
    }
    return false;
  }

  advance(): T | null {
    if (!this.isAtEnd()) {
      this.position++;
      return this.previous();
    }
    return this.peak();
  }

  // Non modyfying state methods

  check(predicate: CheckPredicate<T>): boolean {
    return predicate(this.peak());
  }

  peak(): T {
    return this.symbols[this.position];
  }

  previous(): T | null {
    if (this.isAtStart()) {
      return null;
    }
    return this.symbols[this.position - 1];
  }

  private isAtStart(): boolean {
    return this.position === 0;
  }

  private isAtEnd(): boolean {
    return this.position === this.symbols.length - 1;
  }
}
