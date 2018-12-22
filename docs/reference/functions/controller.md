# _controller_ function

```js
controller({
  initialState: undefined, // default initial state

  // functions that modify state, the controller object will have
  // methods with the signature functionName(...args):
  mutators: {
    functionName(state, ...args) {
      return newState;
    },
  },

  // methods of the controller object
  methods: {
    // the methods may be async
    async methodName() {
      this.functionName(); // you can use this to call any mutator
      this.anotherMethod(); // ... or method
    },
  },

  // optional method to configure the controller instance
  initialize(options, parent) {
    // access to this behaves like a class constructor
    // all methods are available and bound to the instance
  },
});
```

The controller function receives a specification object (as described above),
and returns a controller factory. You can use the controller factory to create a
controller instance:

```js
const controllerFactory = controller({
  mutators: {
    increment(state) {
      return state + 1;
    },
  },
});

const aControllerInstance = controllerFactory(42);

console.log(aControllerInstance.state); // 42
aControllerInstance.increment();
console.log(aControllerInstance.state); // 43
```

This method provides a convenient way of creating objects that comply with the
[controller] interface. However, depending on your needs, you may consider
alternative ways of creating a controller:

- `controller` function:
  - 👍 Good
    - Mutators are the only way to change the state.
    - It makes easy to migrate Redux code.
    - Methods are bound by default, which is convenient for event handlers.
  - 👎 Not good:
    - You cannot use sub-classing to refactor code.
    - You cannot use future JavaScript class features without re-writing.
    - You need to be consistent about bound methods.
- Sub-class [DefaultController]:
  - 👍 Good
    - Uses ES6 syntax which may play better with tooling, e.g IDE's type
      inference.
    - You can use decorators or other future JavaScript class features, e.g
      private fields.
    - Convenient if you want to refactor common behaviors into sub-classes.
  - 👎 Not good:
    - Exposes the `set` and `assign` methods.
- Use [DefaultController]:
  - 👍 Good
    - All the benefits of sub-classing [DefaultController] without exposing the
      `set` and `assign` methods.
    - It makes easy to decorate the `changes` and `state` properties.
  - 👎 Not good:
    - Requires typing more code.

## Return value

A controller factory function, that receives an initial state and returns a
[controller] object:

```typescript
(initialState: T, options: object, parent: Controller<any>) => Controller<T>
```

## See also

- [DefaultController]: default [controller] implementation.

[controller]: ../interface/Controller.md
[defaultcontroller]: ../classes/DefaultController.md
