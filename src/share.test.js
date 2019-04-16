import { controller, share } from '.';

test('convert a controller changes to a shared observable', () => {
  expect.assertions(2);

  const createController = controller({
    initialState: 0,
    mutators: {
      increment: state => state + 1,
    },
  });
  const testController = share(createController());

  testController.changes.subscribe(state => expect(state).toBe(1));
  testController.changes.subscribe(state => expect(state).toBe(1));

  testController.increment();
});
