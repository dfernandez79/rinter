# _CompositeController_ class

A `CompositeController` composes controllers into one object, for example a
composite of:

```js
{ a: controller1, b: controller2 }
```

will return the state:

```js
{ a: controller1.state, b: controller2.state }
```

## Constructor

```typescript
CompositeController(factories, initialState?, options?, parent?)
```

The `factories` parameter specifies the shape of the composition and how to
create each sub-controller. It's an object of the kind `{key: factoryFunction}`,
where `factoryFunction` receives an initial state and returns a [controller].

The `initialState` parameter is optional, and when omited the controller builds
the initial state from the children default initial states.

Example:

```js
const composite = new CompositeController({
  controllerA: initialState => createAController(initialState),
  controllerB: initialState => new DefaultController(initialState),
});
```

Also the new composite controller instance will have an enumerable property for
each sub-controller:

```js
composite.controllerA; // returns a controller instance
composite.controllerB; // returns a DefaultController instance
```

## Properties

- `state`: Read only. The current state value.
- `changes`: Read only. A hot [Observable] that emits the state each time it
  changes.

## Methods

- `notifyLastChangeOnly(fn)`: Mutes the emission of state changes during the
  execution of `fn`. It will emit a state change after executing `fn`.

[controller]: ../interface/Controller.md
