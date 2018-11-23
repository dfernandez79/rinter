# Rinter

Minimalist state container based on [reactive extensions].

## Install

Rinter requires [RxJS] as peer-dependency:

```shell
npm install --save rinter rxjs
```

```shell
yarn add rinter rxjs
```

## Usage

Instead of mutating your application state directly:

```js
const state = { number: 0 };

// ...
state.number = state.number + 1;
console.log(state.number); // 1
```

Use a controller:

```js
const counter = new CounterController({ number: 0 });

// ...
counter.increase();
console.log(counter.state.number);
```

A controller exposes two read-only properties:

- `state`: the current application state, it's an immutable\* plain object
- `changes`: a hot [Observable] that emits the state each time it changes.

> \* The framework doesn't enforce immutability by using `Object.freeze`.
> However, modifying the state directly will lead to bugs and unexpected
> side-effects.

Your views should use the methods exposed by the controller to modify the state.

A convenient way to create a controller is to sub-class or use
`DefaultController`. To update the state use the `set` or `assign` methods.

```js
import DefaultController from 'rinter';

class Counter extends DefaultController {
  constructor(initialValue = { number: 0 }) {
    super(initialValue);
  }

  increase() {
    this.assign({ number: this.state.number + 1 });
  }
}
```

JavaScript doesn't have protected methods, but it's recommended to treat `set`
or `assign` methods as protected. If you are concerned about exposing those
methods, you can compose `DefaultController` instead of sub-classing it. As long
your controller has the `state` and `changes` properties, you'll be able to use
them in other contexts where the library expects a controller:

```js
class Counter {
  constructor() {
    this.controller = new DefaultController();
  }

  get state() {
    return this.controller.state;
  }

  get changes() {
    return this.controller.changes;
  }

  increase() {
    this.controller.assign({ number: this.state.number + 1 });
  }
}
```

`DefaultController` also has a convenient method to emit only one state change
from multiple actions:

```js
// Counter is a sub-class of DefaultController
const counter = new Counter();

counter.changes.subscribe(state => {
  console.log(state);
});

counter.notifyLastChangeOnly(() => {
  counter.increase();
  counter.increase();
  counter.increase();
});

// will output only {number: 3}
```

To compose various controllers into one object, you can use a
`CompositeController`.

A `CompositeController` receives an object with controller factories, and
provides the `state` and `changes` properties with the composition:

```js
import { CompositeController } from 'rinter';

const composite = new CompositeController(
  {
    first: value => new Counter(value),
    second: value => new Counter(value),
  },
  { first: { number: 0 }, second: { number: 42 } }
);

console.log(composite.state);
// output:
// {first: {number:0}, second: {number:42}
```

It also generates accessors for each controller:

```js
controller.first.increase();
console.log(controller.state);
// output:
// {first: {number:1}, second: {number:42}

controller.changes.subscribe(state => console.log(state));
controller.second.increase();
controller.second.increase();

// will output:
// {first: {number:1}, second: {number:43}
// {first: {number:1}, second: {number:44}
```

Since the properties `state` and `changes` are part of the controller contract,
you cannot use those names to identify controllers:

```js
// ERROR! clashes with composite.state
new CompositeController({ state: value => MyController(value) }, { state: {} });

// OK - {state:10} is the initial value for Other
new CompositeController(
  { other: value => Other(value) },
  { other: { state: 10 } }
);
```

Is expected that controller constructors receive the initial state value as the
first argument. If that is the case, you can use the `create` function to make
the `CompositeController` definition shorter:

```js
import { create } from 'rinter';

// ...
const composite = new CompositeController(
  {
    first: create(Counter),
    second: create(Counter),
  },
  { first: { number: 0 }, second: { number: 42 } }
);
```

## Migrating from Redux

By using decorators, it's possible to define methods that receive the current
state and returns a new state:

```js
import { assign, DefaultController } from 'rinter';

class Counter extends DefaultController {
  @assign
  increment(state) {
    return { count: state.count + 1 };
  }
}

// usage
const controller = new Counter({ count: 0 });
controller.increase();
```

The decorators are also helpful to migrate reducers from [Redux]:

```js
// Usually Redux code is refactored to use one function per action type

function increment(state) {
  return state.count + 1;
}
function decrement(state) {
  return state.count - 1;
}

function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return increment(state);
    case 'DECREMENT':
      return decrement(state);
    default:
      return state;
  }
}
```

Using the `@set` decorator, the migration is straight forward:

```js
import { mutator, DefaultController } from 'rinter';

class Counter extends DefaultController {
  @set
  increment(state) {
    return state.count + 1;
  }

  @set
  decrement(state) {
    return state.count - 1;
  }
}
```

Decorators are [proposed as a JavaScript enhancement] but are not standardized
yet. Your project needs to include the proper [Babel plugins] to support
decorators.

Note that decorators are implemented as functions, meaning that rinter doesn't
require decorators support to work.

Another migration alternative is to create a factory function that creates a
controller from your reducer functions. You only need to comply with a minimal
interface of two getters: `state` and `changes`.

## API reference

### Top-level exports

**Classes**

- [DefaultController](#defaultcontroller)
- [CompositeController](#compositecontroller)

**Functions**

- create
- debug

**Decorators**

- assign
- set

### DefaultController

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

#### Constructor

`new DefaultController(initialValue)`

Creates a controller instance with the given initial state.

#### Properties

- `state`: Read only. The current state value.
- `changes`: Read only. A hot [Observable] that emits the state each time it
  changes.

#### Methods

- `set(newState)`: Sets the state to `newState` and emits a state change.
- `assign(newState)`: Asumes that state is an object and uses `Object.assign` to
  update the state. It is equivalent to:
  `this.set(Object.assign({}, this.state, newState))`
- `notifyLastChangeOnly(fn)`: Mutes the emission of state changes during the
  execution of `fn`. It will emit a state change after executing `fn`.

### CompositeController

A `CompositeController` composes controllers into one object, for example a
composite of:

```js
{ a: controller1, b: controller2 }
```

will return the state:

```js
{ a: controller1.state, b: controller2.state }
```

#### Constructor

`new CompositeController(factories, initialValue)`

The `factories` parameter specifies the shape of the composition and how to
create each sub-controller. It's an object of the kind `{key: factoryFunction}`,
where `factoryFunction` receives an initial value and returns a controller.

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

#### Properties

- `state`: Read only. The current state value.
- `changes`: Read only. A hot [Observable] that emits the state each time it
  changes.

#### Methods

- `notifyLastChangeOnly(fn)`: Mutes the emission of state changes during the
  execution of `fn`. It will emit a state change after executing `fn`.

## Troubleshooting

### Log state changes

The [Observable] returned by the `changes` property can be used to trace state
changes:

```js
import { tap } from 'rxjs/operators';

// ...
const changes = controller.changes.pipe(tap(v => console.log(v)));
// subscribe to changes instead of controller.changes
```

However, setting up this in an app that passes references to the controller
instead to the observer can be annoying. The good news is that you can use the
debug utility function to create a proxy to trace state changes:

```js
import { debug } from 'rinter';

const controller = debug(new MyApp(), {
  stateChange(value) {
    console.log(value);
  },
});
```

By default, debug will be verbose logging every state change, but you can make
it silent without having to configure all the options:

```js
import { debug } from 'rinter';

const controller = debug(new MyApp(), debug.SILENT);
```

### Multiple subscribers

Both `DefaultController` and `CompositeController` are going to generate an
error if you try to subscribe to changes multiple times without unsubscribing:

```js
const subscription = controller.changes.subscribe(v => {
  /*... */
});

// the observable is going to generate an error (no error is thrown)
const otherSubscription = controller.changes.subscribe(
  v => {
    /*... */
  },
  () => {
    /* error! you must call subscription.unsubscribe() first */
  }
);
```

That behavior is by design. On a front-end app, you usually have only one
subscriber: the view. If you need to broadcast changes use the `share()`
operator:

```js
import { share } from 'rxjs/operators';

const changes = controller.changes.pipe(share());

// now you can subscribe to changes multiple times
```

### Big bundle size

Rinter itself is small, but [RxJS] is a big module. If your bundle size is big,
make sure to use a bundler that supports ES6 modules and does [tree-shaking] to
remove unnecessary code. For example, Webpack 4+ or Rollup supports that, but
Webpack 3 doesn't.

## License

MIT

[reactive extensions]: https://github.com/ReactiveX/rxjs
[observable]: http://reactivex.io/documentation/observable.html
[webpack]: https://webpack.js.org
[tree-shaking]: https://webpack.js.org/guides/tree-shaking/
[rxjs]: https://github.com/ReactiveX/rxjs
[redux]: https://redux.js.org/
[babel plugins]:
  https://babeljs.io/docs/en/next/babel-plugin-proposal-decorators.html
[proposed as a javascript enhancement]:
  https://github.com/tc39/proposal-decorators
[vuex]: https://vuex.vuejs.org/
