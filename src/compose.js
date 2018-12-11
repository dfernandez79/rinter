import CompositeController from './CompositeController';

export default function compose(factories, defaultInitialState) {
  return function(initialState = defaultInitialState, ...args) {
    return new CompositeController(factories, initialState, ...args);
  };
}
