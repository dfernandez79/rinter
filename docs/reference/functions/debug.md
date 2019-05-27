# _debug_ function

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

It returns [controller] but subscribes an `Observer` to the changes [Observable].

[controller]: ../interface/Controller.md
[observable]: http://reactivex.io/documentation/observable.html
