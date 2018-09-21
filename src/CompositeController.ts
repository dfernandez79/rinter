import { empty, merge, BehaviorSubject, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import mapValues from 'lodash/mapValues';
import transform from 'lodash/transform';

import StateProvider from './StateProvider';
import ValueHolder, { PlainObject, Value } from './ValueHolder';

type ControllerFactory<T extends Value> = (initialValue: T) => StateProvider<T>;

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

type StateProviderConstructor<T extends Value> = {
  new (state: ValueHolder<T>): StateProvider<T>;
};

export const create = <T extends Value>(
  ctor: StateProviderConstructor<T>
): ControllerFactory<T> => (initialValue: T) =>
  new ctor(new ValueHolder(initialValue));

export default class CompositeController<T extends PlainObject>
  implements StateProvider<T> {
  protected _children: CompositeControllerChildren;
  private _state: ValueHolder<T>;
  private _silent: BehaviorSubject<boolean>;

  constructor(factories: ControllerFactoryMap, state: ValueHolder<T>) {
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

  public getState() {
    return this._state.get();
  }

  public changes() {
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
