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

  if (typeof controller === 'function') {
    return (...args) => debug(controller(...args), opts);
  } else {
    controller.changes.subscribe(opts.stateChange);
    return controller;
  }
}

debug.SILENT = SILENT;
debug.VERBOSE = VERBOSE;

export default debug;
