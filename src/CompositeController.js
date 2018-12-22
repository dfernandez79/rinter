import { merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import DefaultController from './DefaultController';

function createChildren(factories, initialState, options, parent) {
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
        ? factory(
            initialState !== undefined ? initialState[key] : undefined,
            options,
            parent
          )
        : new CompositeController(
            factory,
            initialState !== undefined ? initialState[key] : undefined,
            options,
            parent
          );

    return props;
  }, {});

  return { childKeys, children };
}

function defaultMergeChildState(state, childKeyValue) {
  return Object.assign({}, state, childKeyValue);
}

export default class CompositeController {
  constructor(factories = {}, initialState, options = {}, parent, mergeChildState = defaultMergeChildState) {
    const controller = new DefaultController(
      initialState !== undefined ? initialState : {}
    );

    const { childKeys, children } = createChildren(
      factories,
      initialState,
      options,
      parent === undefined ? this : parent
    );

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

    merge(...childObservers)
      .pipe(map(keyValue => mergeChildState(this.state, keyValue)))
      .subscribe(newState => controller.set(newState));
  }
}
