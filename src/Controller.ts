import Value, { PlainValue } from './Value';
import { Observable } from 'rxjs';

export interface StateProvider<T extends PlainValue> {
  /**
   * Return the current state value.
   */
  getState(): T;

  /**
   * Returns an {@link Observable} that reports the state changes.
   */
  changes(): Observable<T>;
}

/**
 * Base class for objects that mutates a {@link Value}.
 *
 * The {@link Value} instance is the state controlled by
 * instances of this class.
 */
export default class Controller<T extends PlainValue>
  implements StateProvider<T> {
  private _state: Value<T>;

  /**
   * Creates a controller with a {@link Value} used to hold the state.
   */
  constructor(state: Value<T>) {
    this._state = state;
  }

  /**
   * @see StateProvider#getState
   */
  getState(): T {
    return this._state.get();
  }

  /**
   * @see StateProvider#changes
   */
  changes(): Observable<T> {
    return this._state.changes();
  }

  /**
   * Updates the state value, triggering change events.
   *
   * This method is intended to be used by sub-classes.
   */
  _updateState(value: T | Partial<T>): void {
    this._state.update(value);
  }
}
