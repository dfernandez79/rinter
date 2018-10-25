import { merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import DefaultController from './DefaultController';

const createChildren = (factories, initialValue) => {
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
        ? factory(initialValue[key])
        : new CompositeController(factory, initialValue[key]);

    return props;
  }, {});

  return { childKeys, children };
};

export const create = ctor => initialValue => new ctor(initialValue);

export default class CompositeController extends DefaultController {
  constructor(factories, initialState) {
    super(initialState);

    const { childKeys, children } = createChildren(factories, initialState);

    const childObservers = childKeys.map(key =>
      children[key].changes.pipe(
        filter(v => this.state[key] !== v),
        map(v => ({ [key]: v }))
      )
    );

    merge(...childObservers).subscribe(keyValue => this.assign(keyValue));

    Object.defineProperties(
      this,
      childKeys.reduce((props, key) => {
        props[key] = { value: children[key], enumerable: true };
        return props;
      }, {})
    );
  }
}
