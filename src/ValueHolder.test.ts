import test from 'ava';
import { BehaviorSubject } from 'rxjs';
import { bufferCount } from 'rxjs/operators';

import { ValueHolder } from '.';

test('initial value', t => {
  t.is(new ValueHolder(10).get(), 10);
});

test('set value', t => {
  const vh = new ValueHolder<number>(10);
  vh.set(5);
  t.is(vh.get(), 5);
});

test('notify current value on subscription', t => {
  t.plan(1);
  const vh = new ValueHolder<number>(0);
  vh.set(2);
  vh.changes().subscribe(v => t.is(v, 2));
});

test('notify initial value on subscription', t => {
  t.plan(1);
  const vh = new ValueHolder<number>(0);
  vh.changes().subscribe(v => t.is(v, 0));
});

test('notify value changes', t => {
  t.plan(2);
  const vh = new ValueHolder<number>(0);
  vh.changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0], 0);
      t.is(buff[1], 2);
    });
  vh.set(2);
});

test('ignore equal values', t => {
  t.plan(2);
  const vh = new ValueHolder<number>(0);
  vh.changes()
    .pipe(bufferCount(2))
    .subscribe(buff => {
      t.is(buff[0], 0);
      t.is(buff[1], 2);
    });
  vh.set(0);
  vh.set(0);
  vh.set(0);
  vh.set(0);
  vh.set(2);
});

test('update value with another observable', t => {
  const source = new BehaviorSubject(10);
  const vh = new ValueHolder<number>(0);
  t.plan(3);
  vh.changes()
    .pipe(bufferCount(3))
    .subscribe(buff => {
      t.is(buff[0], 0);
      t.is(buff[1], 10);
      t.is(buff[2], 25);
    });
  vh.subscribeTo(source);
  source.next(25);
});

test('update with partial object', t => {
  type TestObject = {
    a: number;
    b?: number;
  };
  const vh = new ValueHolder<TestObject>({ a: 1 });
  vh.update({ b: 2 });
  t.deepEqual(vh.get(), { a: 1, b: 2 });
});

test('update with primitive', t => {
  const vh = new ValueHolder<number>(0);
  vh.update(1);
  t.is(vh.get(), 1);
});

test('update with array', t => {
  const vh = new ValueHolder<number[]>([]);
  const newValue = [1];
  vh.update(newValue);
  t.is(vh.get(), newValue);
});
