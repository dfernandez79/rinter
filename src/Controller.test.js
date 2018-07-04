import test from 'ava';
import { bufferCount } from 'rxjs/operators';

import Controller, { Value } from '.';

class Counter extends Controller {
  constructor() {
    super(Value.initial(0));
  }

  increment() {
    this._updateState(this.getState() + 1);
  }

  decrement() {
    this._updateState(this.getState() - 1);
  }
}

test('expose current state', t => {
  t.is(new Counter().getState(), 0);
});

test('expose state changes', t => {
  t.plan(2);
  const counter = new Counter();
  counter
    .changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0], 0);
      t.is(buff[1], 1);
    });
  counter.increment();
});
