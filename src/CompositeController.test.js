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
  console.log(keys);
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
