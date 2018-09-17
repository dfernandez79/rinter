import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

const isObject = (value: any): value is object =>
  value !== null && typeof value === 'object' && Array.isArray(value) === false;

export type Primitive = string | number | boolean;
export type PlainObject = { [key: string]: PlainValue };
export type PlainValue = Primitive | PlainObject | PlainArray;
export interface PlainArray extends Array<PlainValue> {}

/**
 * Represents a mutable and observable value.
 * It is intended to be used by a {@link Controller}.
 */
export default class Value<T extends PlainValue> {
  /**
   * Convenience factory method.
   *
   * @see Value#constructor
   */
  static initial<T extends PlainValue>(value: T): Value<T> {
    return new Value(value);
  }

  private _subject: BehaviorSubject<T>;
  private _changes: Observable<T>;

  constructor(initialValue: T) {
    this._subject = new BehaviorSubject(initialValue);
    this._changes = this._subject.pipe(distinctUntilChanged());
  }

  /**
   * Returns the current value.
   */
  get(): T {
    return this._subject.getValue();
  }

  /**
   * Set the value, triggering change events.
   */
  set(newValue: T): void {
    this._subject.next(newValue);
  }

  /**
   * Returns an {@link Observable} that reports the value changes.
   */
  changes(): Observable<T> {
    return this._changes;
  }

  /**
   * Update this value with the values emitted by the given observable.
   */
  subscribeTo(observable: Observable<T>): Subscription {
    return observable.subscribe(this._subject);
  }

  /**
   * An alternative to {@link Value#set} that uses
   * `Object.assign({}, this.get(), value)`
   * if both the current value and the new one are objects.
   */
  update(value: T | Partial<T>): void {
    const currentValue = this.get();
    this.set((isObject(currentValue) && isObject(value)
      ? Object.assign({}, currentValue, value)
      : value) as T);
  }
}
