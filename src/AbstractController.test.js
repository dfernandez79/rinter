import test from 'ava';
import { bufferCount } from 'rxjs/operators';

import AbstractController from '.';

class Counter extends AbstractController {
  constructor(initialValue = { count: 0 }) {
    super(initialValue);
  }

  increment() {
    this._setState({ count: this.state.count + 1 });
  }
}

test('expose current state', t => {
  t.is(new Counter().state.count, 0);
});

test('expose state changes', t => {
  t.plan(2);
  const counter = new Counter();
  counter.changes.pipe(bufferCount(2)).subscribe(buff => {
    t.is(buff[0].count, 0);
    t.is(buff[1].count, 1);
  });
  counter.increment();
});
