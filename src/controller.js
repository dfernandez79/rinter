import DefaultController from './DefaultController';

function noop() {}

function bindAll(obj, names) {
  names.forEach(n => {
    if (typeof obj[n] === 'function') {
      obj[n] = obj[n].bind(obj);
    }
  });
}

export default function controller({
  initialState: defaultInitialState,
  mutators = {},
  methods = {},
  initialize = noop,
}) {
  return function(initialState = defaultInitialState, options = {}, parent) {
    const defaultController = new DefaultController(initialState);

    const initialDescriptors = {
      state: {
        get() {
          return defaultController.state;
        },
      },
      changes: { value: defaultController.changes },
      notifyLastChangeOnly: {
        value(fn) {
          defaultController.notifyLastChangeOnly(fn);
        },
      },
    };

    const newController = Object.create(
      methods,
      Object.keys(mutators).reduce((descriptors, key) => {
        descriptors[key] = {
          value(...args) {
            defaultController.set(
              mutators[key](defaultController.state, ...args)
            );
          },
        };
        return descriptors;
      }, initialDescriptors)
    );

    bindAll(newController, Object.keys(methods));
    initialize.call(newController, options, parent);

    return newController;
  };
}
