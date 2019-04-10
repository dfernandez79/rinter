import share from './share';

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

  const newController = share(controller);
  newController.changes.subscribe(opts.stateChange);

  return newController;
}

debug.SILENT = SILENT;
debug.VERBOSE = VERBOSE;

export default debug;
