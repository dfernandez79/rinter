import test from 'ava';
import { bufferCount } from 'rxjs/operators';

import Controller, { CompositeController } from '.';
import Value from './Value';

class NumberController extends Controller {
  static create(initialValue, valueFactory) {
    return new NumberController(valueFactory(initialValue));
  }

  update(value) {
    this._updateState(value);
  }
}

test('create from factories and initial value', t => {
  const initialValue = { a: 1, b: 1 };
  const composite = CompositeController.create(
    {
      a: NumberController.create,
      b: NumberController.create,
    },
    initialValue
  );

  t.is(composite.getState(), initialValue);
});

test('report changes from children', t => {
  t.plan(4);

  const composite = CompositeController.create(
    {
      a: NumberController.create,
      b: NumberController.create,
    },
    { a: 1, b: 1 }
  );

  composite
    .changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0].a, 1);
      t.is(buff[0].b, 1);
      t.is(buff[1].a, 2);
      t.is(buff[1].b, 1);
    });

  composite._children.a.update(2);
});

test('notify last change only', t => {
  t.plan(4);
  const composite = CompositeController.create(
    {
      a: NumberController.create,
      b: NumberController.create,
    },
    { a: 1, b: 1 }
  );

  composite
    .changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0].a, 1);
      t.is(buff[0].b, 1);
      t.is(buff[1].a, 5);
      t.is(buff[1].b, 6);
    });

  composite._notifyLastChangeOnly(() => {
    composite._children.a.update(composite._children.a.getState() + 1);
    composite._children.a.update(composite._children.a.getState() + 1);
    composite._children.a.update(composite._children.a.getState() + 1);
    composite._children.a.update(composite._children.a.getState() + 1);

    composite._children.b.update(composite._children.b.getState() + 1);
    composite._children.b.update(composite._children.b.getState() + 1);
    composite._children.b.update(composite._children.b.getState() + 1);
    composite._children.b.update(composite._children.b.getState() + 1);
    composite._children.b.update(composite._children.b.getState() + 1);
  });
});

test('compose deep', t => {
  const composite = CompositeController.create(
    {
      position: { x: NumberController.create, y: NumberController.create },
      size: { width: NumberController.create, height: NumberController.create },
    },
    {
      position: { x: 0, y: 0 },
      size: { width: 10, height: 10 },
    }
  );

  t.is(composite.getState().position.x, 0);
  t.is(composite.getState().position.y, 0);
  t.is(composite.getState().size.width, 10);
  t.is(composite.getState().size.height, 10);

  composite._children.position._children.x.update(1);
  t.is(composite.getState().position.x, 1);
});

test('notify initial state', t => {
  t.plan(1);
  const initial = { x: 1, y: 2 };
  const composite = new CompositeController(
    {
      x: NumberController.create,
      y: NumberController.create,
    },
    initial
  );

  composite.changes().subscribe(v => t.is(initial, v));
});

test('use custom value factory', t => {
  const composite = CompositeController.create(
    { x: NumberController.create, y: NumberController.create },
    { x: 10, y: 2 },
    value => new Value(value + 2)
  );
  const { x, y } = composite.getState();
  t.is(x, 12);
  t.is(y, 4);
});
