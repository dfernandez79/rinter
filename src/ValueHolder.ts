import { isPlainObject } from 'lodash';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export type Primitive = string | number | boolean;
export type PlainObject = {
  [key: string]: Value;
};
export type Value = Primitive | PlainObject | PlainArray;
export interface PlainArray extends Array<Value> {}

export default class ValueHolder<T extends Value> {
  private _subject: BehaviorSubject<T>;
  private _changes: Observable<T>;

  constructor(initialValue: T) {
    this._subject = new BehaviorSubject(initialValue);
    this._changes = this._subject.pipe(distinctUntilChanged());
  }

  public get(): T {
    return this._subject.getValue();
  }

  public set(newValue: T): void {
    this._subject.next(newValue);
  }

  public changes(): Observable<T> {
    return this._changes;
  }

  public subscribeTo(observable: Observable<T>): Subscription {
    return observable.subscribe(this._subject);
  }

  public update(value: T | Partial<T>): void {
    const currentValue = this.get();
    this.set((isPlainObject(currentValue) && isPlainObject(value)
      ? Object.assign({}, currentValue, value)
      : value) as T);
  }
}
