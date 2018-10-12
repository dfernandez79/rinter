# Rinter

Minimalist state container based on [reactive extensions].

## Install

> Rinter requires RxJS and Lodash as peer-dependencies

```shell
npm install rinter rxjs lodash
```

```shell
yarn add rinter rxjs lodash
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
- `changes`: an [Observable] that emits the state each time it changes.

> \* The framework doesn't enforce immutability by using `Object.freeze`.
> However, modifying the state directly will lead to bugs and unexpected
> side-effects.

Your views should use the methods exposed by the controller to modify the state.

A convenient way to create a controller is to sub-class `AbstractController`. To
update the state use the protected\* `_set` or `_assign` methods:

```js
import AbstractController from 'rinter';

class Counter extends AbstractController {
  constructor(initialValue = { number: 0 }) {
    super(initialValue);
  }
  increase() {
    this._assign({ number: this.state.number + 1 });
  }
}
```

> \* JavaScript doesn't have protected fields, so it up to you to maintain the
> contract.

`AbstractController` also has a convenient method to emit only one state change
from multiple actions:

```js
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

It receives an object with controller factories, and provides the `state` and
`changes` properties with the composition:

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
you cannot use those name to identify controllers:

```js
new CompositeController({ state: value => MyController(value) }, { state: {} }); // ERROR! clashes with composite.state

new CompositeController(
  { other: value => Other(value) },
  { other: { state: 10 } }
); // OK - {state:10} is the initial value for Other
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
controller.changes.subscribe(v => console.log(v));
```

## Big bundle size

Rinter itself is small, but both RxJS and Lodash are big modules. The library
packages include ES6 JavaScript files that bundlers like [Webpack] should use
automatically. If your bundle size is big, make sure to use a bundler that
supports ES6 modules and does [tree-shaking] to remove unnecessary code. For
example, Webpack 4+ or Rollup supports that, but Webpack 3 doesn't.

## License

MIT

[reactive extensions]: https://github.com/ReactiveX/rxjs
[observable]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html
[webpack]: https://webpack.js.org
[tree-shaking]: https://webpack.js.org/guides/tree-shaking/
