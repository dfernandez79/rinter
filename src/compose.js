import CompositeController from './CompositeController';

export default function compose(factories, defaultInitialState) {
  return function(initialState = defaultInitialState) {
    return new CompositeController(factories, initialState);
  };
}
