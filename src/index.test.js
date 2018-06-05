import test from 'ava';
import { bufferCount } from 'rxjs/operators';

import State, { CompositeState } from '.';

test('State initial value', t => {
  const state = new State(10);
  t.is(state.value, 10);
});

test('State set value', t => {
  const state = new State(10);
  state.value = 5;
  t.is(state.value, 5);
});

test('State notifies the current value on subscription', t => {
  t.plan(1);
  const state = new State(0);
  state.value = 2;
  state.changes.subscribe(v => t.is(v, 2));
});

test('State notifies the initial value on subscription', t => {
  t.plan(1);
  const state = new State(0);
  state.changes.subscribe(v => t.is(v, 0));
});

test('State notifies changes to values', t => {
  t.plan(2);
  const state = new State(0);
  state.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0], 0);
    t.is(buff[1], 2);
  });
  state.value = 2;
});

test('Only state changes are reported', t => {
  t.plan(2);
  const state = new State(0);
  state.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0], 0);
    t.is(buff[1], 2);
  });
  state.value = 0;
  state.value = 0;
  state.value = 0;
  state.value = 0;
  state.value = 2;
});

test('Create from factories and initial value', t => {
  const initialValue = { a: 1, b: 1 };
  const composite = new CompositeState(
    {
      a: v => new State(v),
      b: v => new State(v),
    },
    initialValue
  );

  t.is(composite.value, initialValue);
});

test('Report changes from children', t => {
  t.plan(4);

  const composite = new CompositeState(
    {
      a: v => new State(v),
      b: v => new State(v),
    },
    { a: 1, b: 1 }
  );

  composite.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0].a, 1);
    t.is(buff[0].b, 1);
    t.is(buff[1].a, 2);
    t.is(buff[1].b, 1);
  });

  composite.children.a.value = 2;
});

test('Notify last change only', t => {
  t.plan(4);
  const composite = new CompositeState(
    {
      a: v => new State(v),
      b: v => new State(v),
    },
    { a: 1, b: 1 }
  );

  composite.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0].a, 1);
    t.is(buff[0].b, 1);
    t.is(buff[1].a, 5);
    t.is(buff[1].b, 6);
  });

  composite.notifyLastChangeOnly(() => {
    composite.children.a.update(v => v + 1);
    composite.children.a.update(v => v + 1);
    composite.children.a.update(v => v + 1);
    composite.children.a.update(v => v + 1);

    composite.children.b.update(v => v + 1);
    composite.children.b.update(v => v + 1);
    composite.children.b.update(v => v + 1);
    composite.children.b.update(v => v + 1);
    composite.children.b.update(v => v + 1);
  });
});

test('Compose deep', t => {
  const composite = new CompositeState(
    {
      position: { x: State.create, y: State.create },
      size: { width: State.create, height: State.create },
    },
    {
      position: { x: 0, y: 0 },
      size: { width: 10, height: 10 },
    }
  );

  t.is(composite.value.position.x, 0);
  t.is(composite.value.position.y, 0);
  t.is(composite.value.size.width, 10);
  t.is(composite.value.size.height, 10);

  composite.children.position.children.x.value = 1;
  t.is(composite.value.position.x, 1);
});
