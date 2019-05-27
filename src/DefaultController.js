import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export default class DefaultController {
  constructor(initialState) {
    let state = initialState;
    let silent = false;
    let observer = undefined;

    const changes = Observable.create(obs => {
      if (observer !== undefined) {
        throw new Error(
          'Unexpected state: DefaultController internally handles only one observer at a time. Report this bug to https://git.io/fjRmP'
        );
      }

      observer = obs;

      return () => {
        observer = undefined;
      };
    }).pipe(share());

    Object.defineProperties(this, {
      state: {
        get() {
          return state;
        },
      },

      changes: {
        value: changes,
      },

      set: {
        value(newState) {
          state = newState;
          if (!silent && observer !== undefined) {
            observer.next(newState);
          }
        },
      },

      notifyLastChangeOnly: {
        value(fn) {
          silent = true;
          const prevState = state;
          try {
            fn();
          } finally {
            silent = false;
            if (observer !== undefined && prevState !== state) {
              observer.next(state);
            }
          }
        },
      },
    });
  }
}
