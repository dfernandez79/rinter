# class `DefaultController`

> **Author's note about controller implementation:**
>
> There are many ways to create objects in JavaScript: define instances directly
> using closures to handle private state, define instances using prototypical
> inheritance, or define instances using a class. While this library uses
> classes, it defines some properties like `state` and `changes` directly using
> `Object.defineProperty` with the `configurable` and `writable` flags set to
> `false`. This approach limits extension, but helps to enforce the state scope.
> Many times I considered taking different approaches: abandon the class syntax
> in favor of some custom object creation (like in [Vuex]); use private fields
> with Babel plugins; use fields with some prefix (like `_`) to indicate that
> you should not touch them. But, I keep using the `defineProperty` in the
> constructor: 99% of the time you shouldn't need to override or extend the
> `state` or `changes` properties, and for the 1%, you can use composition. I'll
> reconsider it if it's problematic.

## Constructor

`new DefaultController(initialValue)`

Creates a controller instance with the given initial state.

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
[vuex]: https://vuex.vuejs.org/
