import test from 'ava';

import { set, assign, DefaultController } from '.';

class Counter extends DefaultController {
  @assign
  increment(state) {
    return { count: state.count + 1 };
  }

  @assign
  add(state, n) {
    return { count: state.count + n };
  }

  @assign
  addProp(state, prop) {
    return prop;
  }

  @set
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

test('assign state', t => {
  const controller = new Counter({ count: 0 });
  controller.addProp({ prop: true });
  t.deepEqual(controller.state, { count: 0, prop: true });
});

test('set state', t => {
  const controller = new Counter({ count: 1 });
  controller.reset();
  t.deepEqual(controller.state, { reset: true });
});
