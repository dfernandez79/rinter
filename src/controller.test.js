import test from 'ava';
import { compose, controller } from '.';

const counter = controller({
  initialState: 1,
  mutators: {
    increment(state) {
      return state + 1;
    },
  },
  methods: {
    twoTimes() {
      this.increment();
      this.increment();
    },
  },
});

test('initial state', t => {
  const testCounter = counter();

  t.is(testCounter.state, 1);
});

test('state changes', t => {
  t.plan(1);
  const testCounter = counter();
  testCounter.changes.subscribe(v => {
    t.is(v, 2);
  });
  testCounter.increment();
});

test('notify last change only', t => {
  t.plan(1);

  const testCounter = counter(0);

  testCounter.changes.subscribe(v => {
    t.is(v, 5);
  });

  testCounter.notifyLastChangeOnly(() => {
    testCounter.twoTimes();
    testCounter.twoTimes();
    testCounter.increment();
  });
});

test('composition', t => {
  const xy = compose({
    x: counter,
    y: counter,
  })();

  t.deepEqual(xy.state, { x: 1, y: 1 });
  xy.x.increment();
  t.deepEqual(xy.state, { x: 2, y: 1 });
  xy.y.twoTimes();
  t.deepEqual(xy.state, { x: 2, y: 3 });
});