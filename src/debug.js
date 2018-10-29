import { share } from 'rxjs/operators';

export const DEBUG_SILENT = {
  stateChange() {},
};

/* eslint-disable no-console */
export const DEBUG_VERBOSE = {
  stateChange(value) {
    console.log(value);
  },
};
/* eslint-enable */

export const DEFAULT_OPTIONS = DEBUG_SILENT;

function debug(controller, options = DEFAULT_OPTIONS) {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options);

  const changes = controller.changes.pipe(share());
  changes.subscribe(opts.stateChange);

  const handlers = {
    get(target, prop, receiver) {
      if (prop === 'changes') return changes;

      return Reflect.get(target, prop, receiver);
    },
  };

  return new Proxy(controller, handlers);
}

export default debug;
