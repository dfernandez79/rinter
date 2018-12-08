# Class `DefaultController`

## Constructor

`new DefaultController(initialValue)`

Creates a [controller] instance with the given initial state.

## Properties

- `state`: Read only. The current state value.
- `changes`: Read only. A hot [Observable] that emits the state each time it
  changes.

## Methods

- `set(newState)`: Sets the state to `newState` and emits a state change.
- `assign(newState)`: Asumes that state is an object and uses `Object.assign` to
  update the state. It is equivalent to:
  `this.set(Object.assign({}, this.state, newState))`
- `notifyLastChangeOnly(fn)`: Mutes the emission of state changes during the
  execution of `fn`. It will emit a state change after executing `fn`.

[observable]: http://reactivex.io/documentation/observable.html
[controller]: ../interface/Controller.md
