import DefaultController from './DefaultController';

export default function controller({
  initialState: defaultInitialState,
  mutators = {},
  methods = {},
}) {
  return function(initialState = defaultInitialState) {
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

    return newController;
  };
}
