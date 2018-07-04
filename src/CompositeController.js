import { BehaviorSubject, merge, empty } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

import mapValues from 'lodash/mapValues';
import transform from 'lodash/transform';
import isFunction from 'lodash/isFunction';

import Value from './Value';

const createChildren = (factories, initialValue, valueFactory) =>
  mapValues(
    factories,
    (factory, key) =>
      isFunction(factory)
        ? factory(initialValue[key], valueFactory)
        : CompositeController.create(factory, initialValue[key], valueFactory)
  );

export default class CompositeController {
  static create(factories, initialValue, valueFactory = Value.initial) {
    return new CompositeController(factories, initialValue, valueFactory);
  }

  constructor(factories, initialValue, valueFactory = Value.initial) {
    this._state = valueFactory(initialValue);
    this._children = createChildren(factories, initialValue, valueFactory);
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
      this._silent.pipe(switchMap(v => (v ? empty() : childChanges)))
    );
  }

  getState() {
    return this._state.get();
  }

  changes() {
    return this._state.changes();
  }

  _notifyLastChangeOnly(fn) {
    this._silent.next(true);
    try {
      fn();
    } finally {
      this._silent.next(false);
    }
  }
}
