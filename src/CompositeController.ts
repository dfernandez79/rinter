import { BehaviorSubject, merge, empty, Observable } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

import mapValues from 'lodash/mapValues';
import transform from 'lodash/transform';

import Value, { PlainValue, PlainObject } from './Value';
import { StateProvider } from './Controller';

type ControllerFactory<T extends PlainValue> = (
  initialValue: T
) => StateProvider<T>;

type ControllerFactoryMap = {
  [key: string]: ControllerFactory<any>;
};

type CompositeControllerChildren = {
  [key: string]: StateProvider<any>;
};

const createChildren = <T extends PlainObject>(
  factories: ControllerFactoryMap,
  initialValue: T
) => mapValues(factories, (factory, key) => factory(initialValue[key]));

type StateProviderConstructor<T extends PlainValue> = {
  new (state: Value<T>): StateProvider<T>;
};

export const create = <T extends PlainValue>(
  ctor: StateProviderConstructor<T>
): ControllerFactory<T> => (initialValue: T) =>
  new ctor(Value.initial(initialValue));

export default class CompositeController<T extends PlainObject>
  implements StateProvider<T> {
  private _state: Value<T>;
  private _silent: BehaviorSubject<boolean>;
  protected _children: CompositeControllerChildren;

  constructor(factories: ControllerFactoryMap, state: Value<T>) {
    this._state = state;
    this._children = createChildren(factories, state.get());
    this._silent = new BehaviorSubject(false);

    const childChanges = merge(
      ...transform(
        this._children,
        (observables, child, key) => {
          observables.push(
            child.changes().pipe(filter(v => this.getState()[key] !== v))
          );
        },
        []
      )
    ).pipe(map(() => mapValues(this._children, c => c.getState())));

    this._state.subscribeTo(
      this._silent.pipe(
        switchMap(v => (v ? empty() : (childChanges as Observable<T>)))
      )
    );
  }

  /**
   * @see StateProvider#getState
   */
  getState() {
    return this._state.get();
  }

  /**
   * @see StateProvider#changes
   */
  changes() {
    return this._state.changes();
  }

  protected _notifyLastChangeOnly(fn: () => void) {
    this._silent.next(true);
    try {
      fn();
    } finally {
      this._silent.next(false);
    }
  }
}
