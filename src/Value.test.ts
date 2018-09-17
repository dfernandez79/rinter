import test from 'ava';
import { bufferCount } from 'rxjs/operators';

import { Value } from '.';
import { BehaviorSubject } from 'rxjs';

test('initial value', t => {
  t.is(Value.initial(10).get(), 10);
});

test('set value', t => {
  const value = Value.initial<number>(10);
  value.set(5);
  t.is(value.get(), 5);
});

test('notify current value on subscription', t => {
  t.plan(1);
  const value = Value.initial<number>(0);
  value.set(2);
  value.changes().subscribe(v => t.is(v, 2));
});

test('notify initial value on subscription', t => {
  t.plan(1);
  const value = Value.initial<number>(0);
  value.changes().subscribe(v => t.is(v, 0));
});

test('notify value changes', t => {
  t.plan(2);
  const value = Value.initial<number>(0);
  value
    .changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0], 0);
      t.is(buff[1], 2);
    });
  value.set(2);
});

test('ignore equal values', t => {
  t.plan(2);
  const value = Value.initial<number>(0);
  value
    .changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0], 0);
      t.is(buff[1], 2);
    });
  value.set(0);
  value.set(0);
  value.set(0);
  value.set(0);
  value.set(2);
});

test('update value with another observable', t => {
  const source = new BehaviorSubject(10);
  const value = Value.initial<number>(0);
  t.plan(3);
  value
    .changes()
    .pipe(bufferCount(3))
    .subscribe(buff => {
      t.is(buff[0], 0);
      t.is(buff[1], 10);
      t.is(buff[2], 25);
    });
  value.subscribeTo(source);
  source.next(25);
});

test('update with partial object', t => {
  type TestObject = {
    a: number;
    b?: number;
  };
  const value = Value.initial<TestObject>({ a: 1 });
  value.update({ b: 2 });
  t.deepEqual(value.get(), { a: 1, b: 2 });
});

test('update with primitive', t => {
  const value = Value.initial<number>(0);
  value.update(1);
  t.is(value.get(), 1);
});

test('update with array', t => {
  const state = Value.initial<number[]>([]);
  const newValue = [1];
  state.update(newValue);
  t.is(state.get(), newValue);
});
