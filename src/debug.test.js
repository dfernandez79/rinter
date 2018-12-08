import test from 'ava';

import { debug, controller, CompositeController, DefaultController } from '.';

test('trace state changes from DefaultController', t => {
  const buff = [];

  const testController = debug(new DefaultController({ value: 1 }), {
    stateChange(value) {
      buff.push(value);
    },
  });

  testController.set({ value: 2 });
  testController.set({ value: 3 });

  t.deepEqual(buff, [{ value: 2 }, { value: 3 }]);
});

test('trace state changes from CompositeController', t => {
  const buff = [];

  const testController = debug(
    new CompositeController(
      { first: v => new DefaultController(v) },
      { first: { value: 1 } }
    ),
    {
      stateChange(value) {
        buff.push(value);
      },
    }
  );

  testController.first.set({ value: 2 });
  testController.first.set({ value: 3 });

  t.deepEqual(buff, [{ first: { value: 2 } }, { first: { value: 3 } }]);
});

test('trace state changes from controller', t => {
  const buff = [];

  const targetController = controller({
    initialState: { value: 1 },
    mutators: {
      set(state, value) {
        return value;
      },
    },
  });

  const testController = debug(targetController(), {
    stateChange(value) {
      buff.push(value);
    },
  });

  testController.set({ value: 2 });
  testController.set({ value: 3 });

  t.deepEqual(buff, [{ value: 2 }, { value: 3 }]);
});
