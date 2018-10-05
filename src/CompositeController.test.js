import test from 'ava';
import { bufferCount } from 'rxjs/operators';

import { create, AbstractController, CompositeController } from '.';

class Counter extends AbstractController {
  constructor(initialValue = { count: 0 }) {
    super(initialValue);
  }

  increment() {
    this._setState({ count: this.state.count + 1 });
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
  t.plan(4);

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

  composite.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0].a.count, 1);
    t.is(buff[0].b.count, 1);
    t.is(buff[1].a.count, 2);
    t.is(buff[1].b.count, 1);
  });

  composite.a.increment();
});

test('notify initial state', t => {
  t.plan(1);

  const initial = { a: 1, b: 2 };
  const composite = new CompositeController(
    {
      a: create(Counter),
      b: create(Counter),
    },
    initial
  );

  composite.changes.subscribe(v => t.is(initial, v));
});

test('notify last change only', t => {
  t.plan(4);

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

  composite.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0].a.count, 1);
    t.is(buff[0].b.count, 1);
    t.is(buff[1].a.count, 5);
    t.is(buff[1].b.count, 6);
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