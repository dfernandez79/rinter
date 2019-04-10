# _share_ function

```js
share(controller);
```

Share it's a utility function that converts the [controller]'s changes
observable to a shared observable using the [RxJS] share operator.

## Return value

It returns a new [controller] instance that decorates the given `controller`.

[controller]: ../interface/Controller.md
[rxjs]: https://github.com/ReactiveX/rxjs
