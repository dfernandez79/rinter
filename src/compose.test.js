import test from 'ava';

import { controller, compose } from '.';

const counter = controller({
  initialState: { count: 0 },

  constructor(initialState, argA, argB) {
    this.argA = argA;
    this.argB = argB;
  },
});

test('create with default initial state', t => {
  const initialState = { a: { count: 1 }, b: { count: 1 } };

  const compositeFactory = compose(
    {
      a: counter,
      b: counter,
    },
    initialState
  );

  const composite = compositeFactory();

  t.is(composite.state, initialState);
});

test('create without initial state', t => {
  const compositeFactory = compose({
    a: counter,
    b: counter,
  });

  const composite = compositeFactory();

  t.deepEqual(composite.state, { a: { count: 0 }, b: { count: 0 } });
});

test('create with initial state', t => {
  const compositeFactory = compose({
    a: counter,
    b: counter,
  });

  const composite = compositeFactory({ a: { count: 1 }, b: { count: 2 } });

  t.deepEqual(composite.state, { a: { count: 1 }, b: { count: 2 } });
});

test('create instance with additional arguments', t => {
  const factory = compose({ counter });

  const composite = factory({ count: 1 }, 'test', 'arg');

  t.is(composite.counter.argA, 'test');
  t.is(composite.counter.argB, 'arg');
});
