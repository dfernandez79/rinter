import test from 'ava';

import { overwriteState, mutator, DefaultController } from '.';

class Counter extends DefaultController {
  @mutator
  increment(state) {
    return { count: state.count + 1 };
  }

  @mutator
  add(state, n) {
    return { count: state.count + n };
  }

  @mutator
  addProp(state, prop) {
    return prop;
  }

  @overwriteState
  reset() {
    return { reset: true };
  }
}

test('call method from mutator function', t => {
  const controller = new Counter({ count: 0 });
  controller.increment();
  t.is(controller.state.count, 1);
});

test('pass arguments to mutator function', t => {
  const controller = new Counter({ count: 10 });
  controller.add(10);
  t.is(controller.state.count, 20);
});

test('assign by default', t => {
  const controller = new Counter({ count: 0 });
  controller.addProp({ prop: true });
  t.deepEqual(controller.state, { count: 0, prop: true });
});

test('overwrite state', t => {
  const controller = new Counter({ count: 1 });
  controller.reset();
  t.deepEqual(controller.state, { reset: true });
});
