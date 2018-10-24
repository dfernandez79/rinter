import test from 'ava';

import AbstractController from '.';

class Counter extends AbstractController {
  constructor(initialValue = { count: 0 }) {
    super(initialValue);
  }

  increment() {
    this._assign({ count: this.state.count + 1 });
  }
}

class StateUpdateTester extends AbstractController {
  constructor(
    initialValue = {
      contents: {
        value: 1,
      },
    }
  ) {
    super(initialValue);
  }

  assign(value) {
    this._assign(value);
  }

  set(value) {
    this._set(value);
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

test('_assign uses Object.assign', t => {
  const controller = new StateUpdateTester();
  t.deepEqual(controller.state, {
    contents: {
      value: 1,
    },
  });

  controller.assign({ flag: true });

  t.deepEqual(controller.state, {
    contents: {
      value: 1,
    },
    flag: true,
  });
});

test('_set changes the value', t => {
  const controller = new StateUpdateTester();
  t.deepEqual(controller.state, {
    contents: {
      value: 1,
    },
  });

  controller.set({ flag: true });

  t.deepEqual(controller.state, {
    flag: true,
  });
});

test('supports multiple subscriptions', t => {
  t.plan(3);
  const counter = new Counter();

  counter.changes.subscribe(v => {
    t.is(v.count, 1);
  });

  counter.changes.subscribe(v => {
    t.is(v.count, 1);
  });

  counter.changes.subscribe(v => {
    t.is(v.count, 1);
  });

  counter.increment();
});
