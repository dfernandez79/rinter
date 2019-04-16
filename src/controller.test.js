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

test('initial state', () => {
  const testCounter = counter();

  expect(testCounter.state).toBe(1);
});

test('state changes', () => {
  expect.assertions(1);
  const testCounter = counter();
  testCounter.changes.subscribe(v => {
    expect(v).toBe(2);
  });
  testCounter.increment();
});

test('notify last change only', () => {
  expect.assertions(1);

  const testCounter = counter(0);

  testCounter.changes.subscribe(v => {
    expect(v).toBe(5);
  });

  testCounter.notifyLastChangeOnly(() => {
    testCounter.twoTimes();
    testCounter.twoTimes();
    testCounter.increment();
  });
});

test('composition', () => {
  const xy = compose({
    x: counter,
    y: counter,
  })();

  expect(xy.state).toEqual({ x: 1, y: 1 });
  xy.x.increment();
  expect(xy.state).toEqual({ x: 2, y: 1 });
  xy.y.twoTimes();
  expect(xy.state).toEqual({ x: 2, y: 3 });
});

test('methods are bound', () => {
  const testCounter = counter();
  const testCounterTwo = counter();
  const twoTimes = testCounter.twoTimes;
  const incrementOther = testCounterTwo.increment;

  twoTimes();
  incrementOther();

  expect(testCounter.state).toBe(3);
  expect(testCounterTwo.state).toBe(2);
});

test('initialize', () => {
  const opts = {};
  const parent = {};

  const testController = controller({
    initialize(options, parent) {
      this.options = options;
      this.parent = parent;
    },
  })(undefined, opts, parent);

  expect(testController.options).toBe(opts);
  expect(testController.parent).toBe(parent);
});

test('define DEFAULT_INITIAL_STATE', () => {
  const testController = controller({
    initialState: {
      test: 'This is a default state',
    },
  });

  expect(testController.DEFAULT_INITIAL_STATE).toEqual({
    test: 'This is a default state',
  });
});
