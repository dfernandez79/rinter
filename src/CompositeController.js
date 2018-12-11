import { merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import DefaultController from './DefaultController';

const createChildren = (composite, factories, initialState, ...args) => {
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
            ...args,
            composite
          )
        : new SubCompositeController(
            composite,
            factory,
            initialState !== undefined ? initialState[key] : undefined,
            ...args
          );

    return props;
  }, {});

  return { childKeys, children };
};

class AbstractCompositeController {
  constructor(createChildrenImpl, factories, initialState, ...args) {
    const controller = new DefaultController(
      initialState !== undefined ? initialState : {}
    );

    const { childKeys, children } = createChildrenImpl(
      this,
      factories,
      initialState,
      ...args
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

export default class CompositeController extends AbstractCompositeController {
  constructor(factories, initialState, ...args) {
    super(createChildren, factories, initialState, ...args);
  }
}

class SubCompositeController extends AbstractCompositeController {
  constructor(parent, factories, initialState, ...args) {
    super(
      (composite, ...rest) => createChildren(parent, ...rest),
      factories,
      initialState,
      ...args
    );
  }
}
