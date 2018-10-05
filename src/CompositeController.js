import { empty, merge, BehaviorSubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { mapValues, transform, isFunction } from 'lodash';
import AbstractController from './AbstractController';

const createChildren = (factories, initialValue) =>
  mapValues(
    factories,
    (factory, key) =>
      isFunction(factory) ? factory(initialValue[key]) : new CompositeController(factory, initialValue[key])
  );

export const create = ctor => initialValue => new ctor(initialValue);

export default class CompositeController extends AbstractController {
  constructor(factories, initialState) {
    super(initialState);

    const children = createChildren(factories, initialState);

    const childChanges = merge(
      ...transform(
        children,
        (observables, child, key) => {
          observables.push(child.changes.pipe(filter(v => this.state[key] !== v)));
        },
        []
      )
    ).pipe(map(() => mapValues(children, c => c.state)));

    Object.defineProperties(this, {
      _silent: { value: new BehaviorSubject(false) },
      ...mapValues(children, value => ({ value, enumerable: true })),
    });

    this._silent.pipe(switchMap(v => (v ? empty() : childChanges))).subscribe(this._subject);
  }

  notifyLastChangeOnly(fn) {
    this._silent.next(true);
    try {
      fn();
    } finally {
      this._silent.next(false);
    }
  }
}
