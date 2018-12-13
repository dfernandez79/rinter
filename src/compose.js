import CompositeController from './CompositeController';

export default function compose(factories, defaultInitialState) {
  return function(initialState = defaultInitialState, options = {}, parent) {
    return new CompositeController(factories, initialState, options, parent);
  };
}
