# Rinter

Minimalist state container based on [reactive extensions].

## Install

Rinter requires RxJS as peer-dependency:

```shell
npm install rinter rxjs
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

## Big bundle size

Rinter itself is small, but RxJS is a big module. If your bundle size is big,
make sure to use a bundler that supports ES6 modules and does [tree-shaking] to
remove unnecessary code. For example, Webpack 4+ or Rollup supports that, but
Webpack 3 doesn't.

## License

MIT

[reactive extensions]: https://github.com/ReactiveX/rxjs
[observable]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html
[webpack]: https://webpack.js.org
[tree-shaking]: https://webpack.js.org/guides/tree-shaking/
