import { DefaultController } from '.';

class Counter extends DefaultController {
  constructor(initialValue = 0) {
    super(initialValue);
  }

  increment() {
    this.set(this.state + 1);
  }
}

test('expose current state', () => {
  const controller = new DefaultController(0);
  expect(controller.state).toBe(0);
});

test('expose state changes', () => {
  expect.assertions(1);
  const counter = new DefaultController(0);
  counter.changes.subscribe(v => {
    expect(v).toBe(1);
  });
  counter.set(1);
});

test('notify last change only', () => {
  expect.assertions(1);

  const counter = new Counter();

  counter.changes.subscribe(v => {
    expect(v).toBe(5);
  });

  counter.notifyLastChangeOnly(() => {
    counter.increment();
    counter.increment();
    counter.increment();
    counter.increment();
    counter.increment();
  });
});

test('set changes the state', () => {
  const controller = new DefaultController(0);
  expect(controller.state).toBe(0);

  controller.set({ flag: true });

  expect(controller.state).toEqual({
    flag: true,
  });
});

test('updates without subscription do not throw', () => {
  const counter = new Counter();

  expect(() => counter.increment()).not.toThrow();
  expect(() => {
    counter.notifyLastChangeOnly(() => {
      counter.increment();
      counter.increment();
    });
  }).not.toThrow();
});

test('Remove subscription', () => {
  const counter = new Counter();
  const changesCallback = jest.fn();
  const subscription = counter.changes.subscribe(changesCallback);
  subscription.unsubscribe();
  counter.increment();
  expect(changesCallback).not.toHaveBeenCalled();
});

test('convert a controller changes to a shared observable', () => {
  expect.assertions(2);

  const counter = new Counter();

  counter.changes.subscribe(state => expect(state).toBe(1));
  counter.changes.subscribe(state => expect(state).toBe(1));

  counter.increment();
});
