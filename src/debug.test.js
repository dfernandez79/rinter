import test from 'ava';

import debug from './debug';
import DefaultController from './DefaultController';

test('trace state changes', t => {
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
