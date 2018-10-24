import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export default class AbstractController {
  constructor(initialState) {
    let state = initialState;
    let silent = false;
    let observer = undefined;

    const changes = Observable.create(obs => {
      if (observer !== undefined)
        throw new Error('Multiple subscriptions are not supported');

      observer = obs;

      return () => {
        observer = undefined;
      };
    });

    Object.defineProperties(this, {
      _set: {
        value: value => {
          state = value;
          if (!silent && observer !== undefined) {
            observer.next(value);
          }
        },
      },
      changes: {
        value: changes.pipe(share()),
      },
      state: {
        get: () => state,
      },
      notifyLastChangeOnly: {
        value: fn => {
          silent = true;
          try {
            fn();
          } finally {
            silent = false;
            if (observer !== undefined) {
              observer.next(state);
            }
          }
        },
      },
    });
  }

  _assign(value) {
    this._set(Object.assign({}, this.state, value));
  }
}
