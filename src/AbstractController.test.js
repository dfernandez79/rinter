import test from 'ava';
import { bufferCount } from 'rxjs/operators';

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

  merge(value) {
    this._merge(value);
  }

  set(value) {
    this._set(value);
  }
}

test('expose current state', t => {
  t.is(new Counter().state.count, 0);
});

test('expose state changes', t => {
  t.plan(2);
  const counter = new Counter();
  counter.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0].count, 0);
    t.is(buff[1].count, 1);
  });
  counter.increment();
});

test('notify last change only', t => {
  t.plan(2);

  const counter = new Counter();

  counter.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0].count, 0);
    t.is(buff[1].count, 5);
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

test('_merge', t => {
  const controller = new StateUpdateTester();

  t.deepEqual(controller.state, {
    contents: {
      value: 1,
    },
  });

  controller.merge({ contents: { flag: true } });

  t.deepEqual(controller.state, {
    contents: {
      value: 1,
      flag: true,
    },
  });
});
