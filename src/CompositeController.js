import { merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import DefaultController from './DefaultController';

const createChildren = (factories, initialState) => {
  const childKeys = Object.keys(factories);

  const children = childKeys.reduce((props, key) => {
    const factory = factories[key];

    if (key === 'state' || key === 'changes') {
      throw new Error(
        `Cannot create the child controller "${key}". The name clashes with the ${key} property, use another name for the controller.`
      );
    }

    props[key] =
      typeof factory === 'function'
        ? factory(initialState !== undefined ? initialState[key] : undefined)
        : new CompositeController(
            factory,
            initialState !== undefined ? initialState[key] : undefined
          );

    return props;
  }, {});

  return { childKeys, children };
};

export const create = ctor => initialValue => new ctor(initialValue);

export const compose = (factories, initialState) =>
  new CompositeController(factories, initialState);

export default class CompositeController {
  constructor(factories, initialState) {
    const controller = new DefaultController(
      initialState !== undefined ? initialState : {}
    );

    const { childKeys, children } = createChildren(factories, initialState);

    if (initialState === undefined) {
      controller.set(
        childKeys.reduce((props, key) => {
          props[key] = children[key].state;
          return props;
        }, {})
      );
    }

    const childObservers = childKeys.map(key =>
      children[key].changes.pipe(
        filter(v => this.state[key] !== v),
        map(v => ({ [key]: v }))
      )
    );

    merge(...childObservers).subscribe(keyValue => controller.assign(keyValue));

    Object.defineProperties(
      this,
      childKeys.reduce((props, key) => {
        props[key] = { value: children[key], enumerable: true };
        return props;
      }, {})
    );

    Object.defineProperties(this, {
      changes: { value: controller.changes },
      state: {
        get() {
          return controller.state;
        },
      },
      notifyLastChangeOnly: {
        value(fn) {
          return controller.notifyLastChangeOnly(fn);
        },
      },
    });
  }
}
