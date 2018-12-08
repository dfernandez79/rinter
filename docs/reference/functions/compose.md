# Function `compose`

```js
compose(
  {
    // each state key is matched to a controller built with a factory function
    controllerNameA: controllerFactoryA,
    controllerNameB: controllerFactoryB,
  },
  // optional default initial state
  {
    controllerNameA: defaultInitialStateA,
    controllerNameB: defaultInitialStateB,
  }
);
```

The compose function receives a specification object (as described above), and
returns a controller factory. It composes multiple controllers into one object.
The composite controller follows the [Controller] interface, and contains
read-only properties to access the child controllers:

```js
const compositeControllerFactory = compose({
  x: aControllerFactory,
  y: anotherControllerFactory,
});

const aControllerInstance = compositeControllerFactory({ x: 1, y: 42 });

console.log(aControllerInstance.state); // returns {x: 1, y: 42}
console.log(aControllerInstance.x.state); // returns 1
console.log(aControllerInstance.y.state); // returns 42
```

The function can also nest the composition of controllers:

```js
const appController = compose({
  users: {
    list: userListController,
    info: userInfoController,
  },
  data: dataController,
});

const anAppInstance = appController();
anAppInstance.users.list; // a userListController instance
```

## Return value

A controller factory function, that receives an initial state and returns a
[controller] object:

```typescript
(initialState: T) => Controller<T>
```

## See also

- [controller](./controller.md) function
- [CompositeController]: implementation used by this function to create a
  composite [controller] instance.

[controller]: ../interface/Controller.md
[CompositeController]: ../classes/CompositeController.md
