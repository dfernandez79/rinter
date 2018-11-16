import { share } from 'rxjs/operators';

const SILENT = {
  stateChange() {},
};

/* eslint-disable no-console */
const VERBOSE = {
  stateChange(value) {
    console.log(value);
  },
};
/* eslint-enable */

function debug(controller, options = VERBOSE) {
  const opts = Object.assign({}, SILENT, options);

  const changes = controller.changes.pipe(share());
  changes.subscribe(opts.stateChange);

  const newController = Object.create(controller, {
    changes: {
      value: changes,
    },
  });

  return newController;
}

debug.SILENT = SILENT;
debug.VERBOSE = VERBOSE;

export default debug;
