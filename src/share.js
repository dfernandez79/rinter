import { share } from 'rxjs/operators';

export default controller =>
  Object.create(controller, {
    changes: {
      value: controller.changes.pipe(share()),
    },
  });
