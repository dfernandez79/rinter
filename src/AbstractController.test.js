import test from 'ava';

import AbstractController from '.';

class Counter extends AbstractController {
  constructor(initialValue = { count: 0 }) {
    super(initialValue);
  }

  increment() {
    this.assign({ count: this.state.count + 1 });
  }
}

test('expose current state', t => {
  t.is(new Counter().state.count, 0);
});

test('expose state changes', t => {
  t.plan(1);
  const counter = new Counter();
  counter.changes.subscribe(v => {
    t.is(v.count, 1);
  });
  counter.increment();
});

test('notify last change only', t => {
  t.plan(1);

  const counter = new Counter();

  counter.changes.subscribe(v => {
    t.is(v.count, 5);
  });

  counter.notifyLastChangeOnly(() => {
    counter.increment();
    counter.increment();
    counter.increment();
    counter.increment();
    counter.increment();
  });
});

test('assign uses Object.assign', t => {
  const controller = new Counter();
  t.deepEqual(controller.state, {
    count: 0,
  });

  controller.assign({ flag: true });

  t.deepEqual(controller.state, {
    count: 0,
    flag: true,
  });
});

test('set changes the state', t => {
  const controller = new Counter();
  t.deepEqual(controller.state, {
    count: 0,
  });

  controller.set({ flag: true });

  t.deepEqual(controller.state, {
    flag: true,
  });
});

test('supports only one subscription', t => {
  t.plan(2);
  const counter = new Counter();

  counter.changes.subscribe(() => {
    t.pass();
  });

  counter.changes.subscribe(
    () => {
      t.fail();
    },
    () => {
      t.pass();
    }
  );

  counter.increment();
});

test('updates without subscription do not throw', t => {
  const counter = new Counter();

  t.notThrows(() => counter.increment());
  t.notThrows(() => {
    counter.notifyLastChangeOnly(() => {
      counter.increment();
      counter.increment();
    });
  });
});

test('Remove subscription', t => {
  const counter = new Counter();
  const subscription = counter.changes.subscribe(() => t.fail());
  subscription.unsubscribe();
  counter.increment();
  t.pass();
});
