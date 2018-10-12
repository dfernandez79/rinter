import { merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { mapValues, transform, isFunction } from 'lodash';
import AbstractController from './AbstractController';

const createChildren = (factories, initialValue) =>
  mapValues(
    factories,
    (factory, key) =>
      isFunction(factory)
        ? factory(initialValue[key])
        : new CompositeController(factory, initialValue[key])
  );

export const create = ctor => initialValue => new ctor(initialValue);

export default class CompositeController extends AbstractController {
  constructor(factories, initialState) {
    super(initialState);

    const children = createChildren(factories, initialState);

    merge(
      ...transform(
        children,
        (observables, child, key) => {
          observables.push(
            child.changes.pipe(filter(v => this.state[key] !== v))
          );
        },
        []
      )
    )
      .pipe(map(() => mapValues(children, c => c.state)))
      .subscribe(this._subject);

    Object.defineProperties(
      this,
      mapValues(children, value => ({ value, enumerable: true }))
    );
  }
}
