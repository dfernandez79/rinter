import test from 'ava';

import { debug, create, CompositeController, DefaultController } from '.';

test('trace state changes from DefaultController', t => {
  const buff = [];

  const controller = debug(new DefaultController({ value: 1 }), {
    stateChange(value) {
      buff.push(value);
    },
  });

  controller.set({ value: 2 });
  controller.set({ value: 3 });

  t.deepEqual(buff, [{ value: 2 }, { value: 3 }]);
});

test('trace state changes from CompositeController', t => {
  const buff = [];

  const controller = debug(
    new CompositeController(
      { first: create(DefaultController) },
      { first: { value: 1 } }
    ),
    {
      stateChange(value) {
        buff.push(value);
      },
    }
  );

  controller.first.set({ value: 2 });
  controller.first.set({ value: 3 });

  t.deepEqual(buff, [{ first: { value: 2 } }, { first: { value: 3 } }]);
});
