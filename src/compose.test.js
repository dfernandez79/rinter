import { controller, compose } from '.';

const counter = controller({
  initialState: { count: 0 },

  initialize(options, parent) {
    this.options = options;
    this.parent = parent;
  },
});

test('create with default initial state', () => {
  const initialState = { a: { count: 1 }, b: { count: 1 } };

  const compositeFactory = compose(
    {
      a: counter,
      b: counter,
    },
    initialState
  );

  const composite = compositeFactory();

  expect(composite.state).toBe(initialState);
});

test('create without initial state', () => {
  const compositeFactory = compose({
    a: counter,
    b: counter,
  });

  const composite = compositeFactory();

  expect(composite.state).toEqual({ a: { count: 0 }, b: { count: 0 } });
});

test('create with initial state', () => {
  const compositeFactory = compose({
    a: counter,
    b: counter,
  });

  const composite = compositeFactory({ a: { count: 1 }, b: { count: 2 } });

  expect(composite.state).toEqual({ a: { count: 1 }, b: { count: 2 } });
});

test('create instance with additional arguments', () => {
  const factory = compose({ counter });
  const opts = {};
  const parent = {};
  const composite = factory({ count: 1 }, opts, parent);

  expect(composite.counter.options).toBe(opts);
  expect(composite.counter.parent).toBe(parent);
});
