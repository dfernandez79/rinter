import test from 'ava';

import { controller, CompositeController } from '.';

const counter = controller({
  initialState: { count: 0 },
  mutators: {
    increment(state) {
      return { count: state.count + 1 };
    },
  },
  constructor(initialState, a, b, parent) {
    this.parent = parent;
    this.argA = a;
    this.argB = b;
  },
});

test('create from factories and initial value', t => {
  const initialState = { a: { count: 1 }, b: { count: 1 } };

  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    initialState
  );

  t.is(composite.state, initialState);
});

test('accessors for child controllers', t => {
  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    {}
  );

  t.true('state' in composite.a);
  t.true('changes' in composite.a);
  t.true('notifyLastChangeOnly' in composite.a);
  t.true('increment' in composite.a);
  t.true('state' in composite.b);
  t.true('changes' in composite.b);
  t.true('notifyLastChangeOnly' in composite.b);
  t.true('increment' in composite.b);
});

test('readonly accessors for child controllers', t => {
  const composite = new CompositeController(
    {
      a: counter,
    },
    {}
  );

  const descriptor = Object.getOwnPropertyDescriptor(composite, 'a');

  t.false(descriptor.writable);
  t.false(descriptor.configurable);
  t.true(descriptor.enumerable);
});

test('child accessors are enumerable', t => {
  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    {}
  );

  const keys = Object.keys(composite);

  t.is(keys.length, 2);
  t.is(keys[0], 'a');
  t.is(keys[1], 'b');
});

test('report changes from children', t => {
  t.plan(2);

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
    t.is(state.a.count, 2);
    t.is(state.b.count, 1);
  });

  composite.a.increment();
});

test('do not notify initial state', t => {
  t.plan(0);

  const initial = { a: 1, b: 2 };
  const composite = new CompositeController(
    {
      a: counter,
      b: counter,
    },
    initial
  );

  composite.changes.subscribe(() => t.fail());
});

test('notify last change only', t => {
  t.plan(2);

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
    t.is(state.a.count, 5);
    t.is(state.b.count, 6);
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

test('compose deep', t => {
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

  t.is(composite.state.position.x.count, 0);
  t.is(composite.state.position.y.count, 0);
  t.is(composite.state.size.width.count, 10);
  t.is(composite.state.size.height.count, 10);

  composite.position.x.increment();
  t.is(composite.state.position.x.count, 1);
});

test('throw error for state child', t => {
  t.throws(() => {
    new CompositeController({ state: counter }, { state: { count: 0 } });
  }, 'Cannot create the child controller "state". The name clashes with the state property, use another name for the controller.');
});

test('throw error for changes child', t => {
  t.throws(() => {
    new CompositeController({ changes: counter }, { changes: { count: 0 } });
  }, 'Cannot create the child controller "changes". The name clashes with the changes property, use another name for the controller.');
});

test('pass the composite instance to the factory function', t => {
  const composite = new CompositeController(
    { counter },
    undefined,
    'test',
    'arg'
  );

  t.is(composite.counter.parent, composite);
  t.is(composite.counter.argA, 'test');
  t.is(composite.counter.argB, 'arg');
});

test('pass the main composite instance to the sub-composite controllers', t => {
  const composite = new CompositeController(
    { another: { counter } },
    undefined,
    'test',
    'arg'
  );

  t.is(composite.another.counter.parent, composite);
  t.is(composite.another.counter.argA, 'test');
  t.is(composite.another.counter.argB, 'arg');
});
