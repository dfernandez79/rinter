import { controller, CompositeController } from '.';

const counter = controller({
  initialState: { count: 0 },
  mutators: {
    increment(state) {
      return { count: state.count + 1 };
    },
  },
  initialize(options, parent) {
    this.options = options;
    this.parent = parent;
  },
});

test('create from factories and initial value', () => {
  const initialState = { a: { count: 1 }, b: { count: 1 } };

  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    initialState
  );

  expect(composite.state).toBe(initialState);
});

test('accessors for child controllers', () => {
  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    {}
  );

  expect('state' in composite.a).toBe(true);
  expect('changes' in composite.a).toBe(true);
  expect('notifyLastChangeOnly' in composite.a).toBe(true);
  expect('increment' in composite.a).toBe(true);
  expect('state' in composite.b).toBe(true);
  expect('changes' in composite.b).toBe(true);
  expect('notifyLastChangeOnly' in composite.b).toBe(true);
  expect('increment' in composite.b).toBe(true);
});

test('readonly accessors for child controllers', () => {
  const composite = new CompositeController(
    {
      a: counter,
    },
    {}
  );

  const descriptor = Object.getOwnPropertyDescriptor(composite, 'a');

  expect(descriptor.writable).toBe(false);
  expect(descriptor.configurable).toBe(false);
  expect(descriptor.enumerable).toBe(true);
});

test('child accessors are enumerable', () => {
  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    {}
  );

  const keys = Object.keys(composite);

  expect(keys.length).toBe(2);
  expect(keys[0]).toBe('a');
  expect(keys[1]).toBe('b');
});

test('report changes from children', () => {
  expect.assertions(2);

  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    {
      a: { count: 1 },
      b: { count: 1 },
    }
  );

  composite.changes.subscribe(state => {
    expect(state.a.count).toBe(2);
    expect(state.b.count).toBe(1);
  });

  composite.a.increment();
});

test('do not notify initial state', () => {
  const changesCallback = jest.fn();

  const initial = { a: 1, b: 2 };
  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    initial
  );

  composite.changes.subscribe(changesCallback);
  expect(changesCallback).not.toHaveBeenCalled();
});

test('notify last change only', () => {
  expect.assertions(2);

  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    {
      a: { count: 1 },
      b: { count: 1 },
    }
  );

  composite.changes.subscribe(state => {
    expect(state.a.count).toBe(5);
    expect(state.b.count).toBe(6);
  });

  composite.notifyLastChangeOnly(() => {
    composite.a.increment();
    composite.a.increment();
    composite.a.increment();
    composite.a.increment();

    composite.b.increment();
    composite.b.increment();
    composite.b.increment();
    composite.b.increment();
    composite.b.increment();
  });
});

test('compose deep', () => {
  const composite = new CompositeController(
    {
      position: { x: counter, y: counter },
      size: { width: counter, height: counter },
    },
    {
      position: { x: { count: 0 }, y: { count: 0 } },
      size: { width: { count: 10 }, height: { count: 10 } },
    }
  );

  expect(composite.state.position.x.count).toBe(0);
  expect(composite.state.position.y.count).toBe(0);
  expect(composite.state.size.width.count).toBe(10);
  expect(composite.state.size.height.count).toBe(10);

  composite.position.x.increment();
  expect(composite.state.position.x.count).toBe(1);
});

test('throw error for state child', () => {
  expect(() => {
    new CompositeController({ state: counter }, { state: { count: 0 } });
  }).toThrowError(
    'Cannot create the child controller "state". The name clashes with the state property, use another name for the controller.'
  );
});

test('throw error for changes child', () => {
  expect(() => {
    new CompositeController({ changes: counter }, { changes: { count: 0 } });
  }).toThrowError(
    'Cannot create the child controller "changes". The name clashes with the changes property, use another name for the controller.'
  );
});

test('pass the composite instance to the factory function', () => {
  const composite = new CompositeController({ counter }, undefined, {
    test: 'options',
  });

  expect(composite.counter.parent).toBe(composite);
  expect(composite.counter.options).toEqual({ test: 'options' });
});

test('pass the main composite instance to the sub-composite controllers', () => {
  const composite = new CompositeController(
    { another: { counter } },
    undefined,
    { test: 'options' }
  );

  expect(composite.another.counter.parent).toBe(composite);
  expect(composite.another.counter.options).toEqual({ test: 'options' });
});
