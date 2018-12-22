import test from 'ava';

import { DefaultController } from '.';

class Counter extends DefaultController {
  constructor(initialValue = 0) {
    super(initialValue);
  }

  increment() {
    this.set(this.state + 1);
  }
}

test('expose current state', t => {
  const controller = new DefaultController(0);
  t.is(controller.state, 0);
});

test('expose state changes', t => {
  t.plan(1);
  const counter = new DefaultController(0);
  counter.changes.subscribe(v => {
    t.is(v, 1);
  });
  counter.set(1);
});

test('notify last change only', t => {
  t.plan(1);

  const counter = new Counter();

  counter.changes.subscribe(v => {
    t.is(v, 5);
  });

  counter.notifyLastChangeOnly(() => {
    counter.increment();
    counter.increment();
    counter.increment();
    counter.increment();
    counter.increment();
  });
});

test('set changes the state', t => {
  const controller = new DefaultController(0);
  t.is(controller.state, 0);

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
