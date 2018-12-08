# debug function

```js
debug(
  // a controller instance to watch
  controller,
  // options
  {
    // called on each state change
    stateChange(value) {},
  }
);
```

Debug it's a utility function that helps to trace state changes.

## Return value

It returns a new [controller] instance that decorates the given `controller`.

[controller]: ../interface/Controller.md
