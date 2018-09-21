import { Observable } from 'rxjs';
import StateProvider from './StateProvider';
import ValueHolder, { Value } from './ValueHolder';

export default class Controller<T extends Value> implements StateProvider<T> {
  private _state: ValueHolder<T>;

  constructor(state: ValueHolder<T>) {
    this._state = state;
  }

  public getState(): T {
    return this._state.get();
  }

  public changes(): Observable<T> {
    return this._state.changes();
  }

  protected _updateState(value: T | Partial<T>): void {
    this._state.update(value);
  }
}
