# controller function

```js
controller({
  initialState: undefined, // default initial state

  // functions that modify state, they controller object will have
  // methods with the signature functionName(...args):
  mutators: {
    functionName(state, ...args) {
      return newState;
    },
  },

  // methods of the controller object
  methods: {
    // you can use async/await
    async methodName() {
      this.functionName(); // you can use this to call any mutator
      this.anotherMethod(); // ... or method
    },
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

## Return value

A controller factory function, that receives an initial state and returns a
[controller] object:

```typescript
(initialState: T) => Controller<T>
```

## See also

- [DefaultController]: default [controller] implementation.

[controller]: ../interface/Controller.md
[defaultcontroller]: ../classes/DefaultController.md
