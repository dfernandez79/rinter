import test from 'ava';
import { bufferCount } from 'rxjs/operators';

import Controller, { CompositeController } from '.';
import { create } from './CompositeController';
import Value from './Value';

class NumberController extends Controller<number> {
  update(value: number) {
    this._updateState(value);
  }
}

type TwoNumbers = { a: number; b: number };
class TwoNumbersController extends CompositeController<TwoNumbers> {
  constructor(state: Value<TwoNumbers>) {
    super({ a: create(NumberController), b: create(NumberController) }, state);
  }

  updateA(n: number) {
    (this._children.a as NumberController).update(n);
  }

  updateB(n: number) {
    (this._children.b as NumberController).update(n);
  }

  multipleUpdates() {
    this._notifyLastChangeOnly(() => {
      this.updateA(this._children.a.getState() + 1);
      this.updateA(this._children.a.getState() + 1);
      this.updateA(this._children.a.getState() + 1);
      this.updateA(this._children.a.getState() + 1);

      this.updateB(this._children.b.getState() + 1);
      this.updateB(this._children.b.getState() + 1);
      this.updateB(this._children.b.getState() + 1);
      this.updateB(this._children.b.getState() + 1);
      this.updateB(this._children.b.getState() + 1);
    });
  }
}

type ShapePosition = { x: number; y: number };
type ShapeSize = { width: number; height: number };
type Shape = {
  position: { x: number; y: number };
  size: { width: number; height: number };
};
class ShapePositionController extends CompositeController<ShapePosition> {
  constructor(state: Value<ShapePosition>) {
    super({ x: create(NumberController), y: create(NumberController) }, state);
  }

  updateX(x: number) {
    (this._children.x as NumberController).update(x);
  }
}

class ShapeSizeController extends CompositeController<ShapeSize> {
  constructor(state: Value<ShapeSize>) {
    super({ x: create(NumberController), y: create(NumberController) }, state);
  }
}
class ShapeController extends CompositeController<Shape> {
  constructor(state: Value<Shape>) {
    super(
      {
        position: create(ShapePositionController),
        size: create(ShapeSizeController),
      },
      state
    );
  }

  updateX(x: number) {
    (this._children.position as ShapePositionController).updateX(x);
  }
}

test('create from factories and initial value', t => {
  const initialValue = { a: 1, b: 1 };
  const composite = new TwoNumbersController(Value.initial(initialValue));

  t.is(composite.getState(), initialValue);
});

test('report changes from children', t => {
  t.plan(4);

  const composite = new TwoNumbersController(Value.initial({ a: 1, b: 1 }));

  composite
    .changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0].a, 1);
      t.is(buff[0].b, 1);
      t.is(buff[1].a, 2);
      t.is(buff[1].b, 1);
    });

  composite.updateA(2);
});

test('notify last change only', t => {
  t.plan(4);
  const composite = new TwoNumbersController(Value.initial({ a: 1, b: 1 }));

  composite
    .changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0].a, 1);
      t.is(buff[0].b, 1);
      t.is(buff[1].a, 5);
      t.is(buff[1].b, 6);
    });

  composite.multipleUpdates();
});

test('compose deep', t => {
  const composite = new ShapeController(
    Value.initial({
      position: { x: 0, y: 0 },
      size: { width: 10, height: 10 },
    })
  );

  t.is(composite.getState().position.x, 0);
  t.is(composite.getState().position.y, 0);
  t.is(composite.getState().size.width, 10);
  t.is(composite.getState().size.height, 10);

  composite.updateX(1);
  t.is(composite.getState().position.x, 1);
});

test('notify initial state', t => {
  t.plan(1);
  const initial = { a: 1, b: 2 };
  const composite = new TwoNumbersController(Value.initial(initial));

  composite.changes().subscribe(v => t.is(initial, v));
});
