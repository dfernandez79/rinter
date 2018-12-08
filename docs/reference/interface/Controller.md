# Controller interface

JavaScript doesn't have support for interfaces or types, but for documentation
purposes, this document describes the controller objects used by this library.
The description uses [TypeScript] syntax.

```typescript
interface Controller<T> {
  state: T;
  changes: Observable<T>;
  notifyLastChangeOnly(fn: () => void);
}
```

- `state`: the current state of the controller. Assume that the state it's a
  immutable value.

- `changes`: a hot [Observable] that emits the state each time it changes.

- `notifyLastChangeOnly(fn)`: a utility method that turns off the emission of
  changes during the execution of `fn`.

[TypeScript]: https://www.typescriptlang.org/
