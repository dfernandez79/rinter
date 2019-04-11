# Rinter

Rinter it's a minimalist state container based on [reactive extensions].

## Installation

```shell
yarn add rinter rxjs
```

## Getting started

Rinter is similar to [Redux], [MobX] or [Vuex]: it handles the application state
in a centralized and predictable way.

To get started we are going to follow the usual example of a number (aka
"Counter"). Imagine an application that shows a number and two actions:
increment and decrement.

<img src="./docs/images/introduction-diagram-1.png" alt="Application displaying a number and two buttons: plus and minus" width="301">

An immutable object describes the application state. And the actions generates a
new instance of the application state:

<img src="./docs/images/introduction-diagram-2.png" alt="Diagram displaying an action called increment that creates a new state" width="511">

Rinter represents this architecture with an object called
[Controller][controller interface]. A controller has a `state` property that
returns the current state value. It also has methods to modify the state. The
view is able to detect changes by the `changes` property.

<img src="./docs/images/introduction-diagram-3.png" alt="Diagram of the Rinter architecture" width="681">

Code (using the [controller] function):

```js
const counter = controller({
  initialState: { count: 0 },

  mutators: {
    increment: state => ({ count: state.count + 1 }),
    decrement: state => ({ count: state.count - 1 }),
  },
});

const appCounter = counter();

appCounter.changes.subscribe(state => {
  // renderView is an example of how the view will respond to state
  // changes and send callbacks to update the state
  renderView(state, {
    onIncrementClick: appCounter.increment,
    onDecrementClick: appCounter.decrement,
  });
});
```

The [controller] function is a shortcut to write less code. If you prefer ES6
classes you can create a [Controller][controller interface] by sub-classing
[DefaultController]:

```js
class Counter extends DefaultController {
  constructor(initialValue = { count: 0 }) {
    super(initialValue);
  }

  increment() {
    this.set({ count: this.state.count + 1 });
  }

  decrement() {
    this.set({ count: this.state.count - 1 });
  }
}

const appCounter = counter();

appCounter.changes.subscribe(state => {
  renderView(state, {
    onIncrementClick: () => appCounter.increment(),
    onDecrementClick: () => appCounter.decrement(),
  });
});
```

## API reference

### Functions

- [controller]
- [compose]
- [debug]
- [share]

### Classes

- [DefaultController]
- [CompositeController]

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

However, setting up this in an app can be annoying. The good news is that you can use the
[debug] utility function to trace state changes:

```js
import { debug } from 'rinter';

const controller = debug(initialController, {
  stateChange(value) {
    console.log(value);
  },
});
```

By default, [debug] will be verbose logging every state change, but you can mute
it without having to configure all the options:

```js
import { debug } from 'rinter';

const controller = debug(initialController, debug.SILENT);
```

### Multiple subscribers

Both `DefaultController` and `CompositeController` are going to generate an
error if you try to subscribe to `changes` multiple times without unsubscribing:

```js
const subscription = controller.changes.subscribe(v => {
  /*... */
});

// The observable is going to generate an error.
// Note that per RxJS design subscribe doesn't throw an exception,
// it emits an error event.
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
subscriber: the view. If you need to broadcast changes use the [share] function:

```js
import { share } from 'rinter';

const sharedController = share(controller);

// now you can subscribe to sharedController.changes multiple times
```

### Big bundle size

Rinter itself is small, but [RxJS] is a big module. If your bundle size is big,
make sure to use a bundler that supports ES6 modules and does [tree-shaking] to
remove unnecessary code. For example, [Webpack] 4+ or [Rollup] supports that,
but Webpack 3 doesn't.

## License

MIT

[reactive extensions]: https://github.com/ReactiveX/rxjs
[rxjs]: https://github.com/ReactiveX/rxjs
[redux]: https://redux.js.org/
[mobx]: https://mobx.js.org/
[vuex]: https://vuex.vuejs.org/
[observable]: http://reactivex.io/documentation/observable.html
[tree-shaking]: https://webpack.js.org/guides/tree-shaking/
[webpack]: https://webpack.js.org
[rollup]: https://rollupjs.org/

[controller]: ./docs/reference/functions/controller.md
[controller interface]: ./docs/reference/interface/controller.md
[compose]: ./docs/reference/functions/compose.md
[share]: ./docs/reference/functions/share.md
[debug]: ./docs/reference/functions/debug.md
[defaultcontroller]: ./docs/reference/classes/DefaultController.md
[compositecontroller]: ./docs/reference/classes/CompositeController.md
