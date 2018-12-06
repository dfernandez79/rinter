import test from 'ava';

import { create, compose, DefaultController, CompositeController } from '.';

class Counter extends DefaultController {
  constructor(initialValue = { count: 0 }) {
    super(initialValue);
  }

  increment() {
    this.assign({ count: this.state.count + 1 });
  }
}

test('create from factories and initial value', t => {
  const initialState = { a: { count: 1 }, b: { count: 1 } };

  const composite = new CompositeController(
    {
      a: create(Counter),
      b: create(Counter),
    },
    initialState
  );

  t.is(composite.state, initialState);
});

test('accessors for child controllers', t => {
  const composite = new CompositeController(
    {
      a: create(Counter),
      b: create(Counter),
    },
    {}
  );

  t.true(composite.a instanceof Counter);
  t.true(composite.b instanceof Counter);
});

test('readonly accessors for child controllers', t => {
  const composite = new CompositeController(
    {
      a: create(Counter),
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
      a: create(Counter),
      b: create(Counter),
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
      a: create(Counter),
      b: create(Counter),
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
      a: create(Counter),
      b: create(Counter),
    },
    initial
  );

  composite.changes.subscribe(() => t.fail());
});

test('notify last change only', t => {
  t.plan(2);

  const composite = new CompositeController(
    {
      a: create(Counter),
      b: create(Counter),
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
      position: { x: create(Counter), y: create(Counter) },
      size: { width: create(Counter), height: create(Counter) },
    },
    {
      position: { x: { count: 0 }, y: { count: 0 } },
      size: { width: { count: 10 }, height: { count: 10 } },
    }
  );

  t.true(composite.position instanceof CompositeController);
  t.true(composite.size instanceof CompositeController);

  t.is(composite.state.position.x.count, 0);
  t.is(composite.state.position.y.count, 0);
  t.is(composite.state.size.width.count, 10);
  t.is(composite.state.size.height.count, 10);

  composite.position.x.increment();
  t.is(composite.state.position.x.count, 1);
});

test('throw error for state child', t => {
  t.throws(() => {
    new CompositeController(
      { state: create(Counter) },
      { state: { count: 0 } }
    );
  }, 'Cannot create the child controller "state". The name clashes with the state property, use another name for the controller.');
});

test('throw error for changes child', t => {
  t.throws(() => {
    new CompositeController(
      { changes: create(Counter) },
      { changes: { count: 0 } }
    );
  }, 'Cannot create the child controller "changes". The name clashes with the changes property, use another name for the controller.');
});

test('Create using compose function', t => {
  const initialState = { a: { count: 1 }, b: { count: 1 } };

  const composite = compose(
    {
      a: create(Counter),
      b: create(Counter),
    },
    initialState
  );

  t.is(composite.state, initialState);
});

test('Create without initial state', t => {
  const composite = compose({
    a: create(Counter),
    b: create(Counter),
  });

  t.deepEqual(composite.state, { a: { count: 0 }, b: { count: 0 } });
});
