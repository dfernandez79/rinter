import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

const isObject = value =>
  value !== null && typeof value === 'object' && Array.isArray(value) === false;

/**
 * Represents a mutable and observable value.
 * It is intended to be used by a {@link Controller}.
 */
export default class Value {
  static initial(value) {
    return new Value(value);
  }

  constructor(initialValue) {
    this._subject = new BehaviorSubject(initialValue);
    this._changes = this._subject.pipe(distinctUntilChanged());
  }

  /**
   * Returns the current value.
   */
  get() {
    return this._subject.getValue();
  }

  /**
   * Set the value, triggering change events.
   * @param {*} newValue
   */
  set(newValue) {
    this._subject.next(newValue);
  }

  /**
   * Returns an Observable that reports the value changes.
   */
  changes() {
    return this._changes;
  }

  subscribeTo(observable) {
    return observable.subscribe(this._subject);
  }

  update(value) {
    const currentValue = this.get();
    this.set(
      isObject(currentValue) && isObject(value)
        ? Object.assign({}, currentValue, value)
        : value
    );
  }
}
