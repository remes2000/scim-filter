export type Optional<V> = { type: 'empty' } | { type: 'some', value: V };

export namespace Optional {
  export const of = <V>(value: V): Optional<V> => ({ type: 'some', value });
  export const some = of;
  export const empty = <V>(): Optional<V> => ({ type: 'empty' });
  export const isEmpty = <V>(o: Optional<V>): o is { type: 'empty' } => o.type === 'empty';
  export const match = <V>(o: Optional<V>, predicate: (o: V) => boolean) => {
    if (isEmpty(o)) return false;
    return predicate(o.value);
  }
}
