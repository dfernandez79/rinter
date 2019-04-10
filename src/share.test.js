import test from 'ava';
import { controller, share } from '.';

test('convert a controller changes to a shared observable', t => {
  t.plan(2);

  const createController = controller({
    initialState: 0,
    mutators: {
      increment: state => state + 1,
    },
  });
  const testController = share(createController());

  testController.changes.subscribe(() => t.pass());
  testController.changes.subscribe(() => t.pass());

  testController.increment();
});
