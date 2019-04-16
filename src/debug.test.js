import { debug, controller, CompositeController, DefaultController } from '.';

test('trace state changes from DefaultController', () => {
  const buff = [];

  const testController = debug(new DefaultController({ value: 1 }), {
    stateChange(value) {
      buff.push(value);
    },
  });

  testController.set({ value: 2 });
  testController.set({ value: 3 });

  expect(buff).toEqual([{ value: 2 }, { value: 3 }]);
});

test('trace state changes from CompositeController', () => {
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

  expect(buff).toEqual([{ first: { value: 2 } }, { first: { value: 3 } }]);
});

test('trace state changes from controller', () => {
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

  expect(buff).toEqual([{ value: 2 }, { value: 3 }]);
});

test('VERBOSE uses console by default', () => {
  const output = [];
  const log = jest.fn((...args) => output.push(args));
  const previousConsole = global.console;
  global.console = { log };

  const testController = debug(
    controller({
      initialState: 0,
      mutators: {
        increment: n => n + 1,
      },
    })()
  );

  testController.increment();
  try {
    expect(log).toHaveBeenCalled();
    expect(output).toEqual([[1]]);
  } finally {
    global.console = previousConsole;
  }
});

test('SILENT never uses console', () => {
  const log = jest.fn();
  const previousConsole = global.console;
  global.console = { log };

  const testController = debug(
    controller({
      initialState: 0,
      mutators: {
        increment: n => n + 1,
      },
    })(),
    debug.SILENT
  );

  testController.increment();
  try {
    expect(log).not.toHaveBeenCalled();
  } finally {
    global.console = previousConsole;
  }
});
