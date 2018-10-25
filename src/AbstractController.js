import { Observable } from 'rxjs';

export default class AbstractController {
  constructor(initialState) {
    let state = initialState;
    let silent = false;
    let observer = undefined;

    const changes = Observable.create(obs => {
      if (observer !== undefined) {
        throw new Error(
          'This controller changes only supports one subscription at a time. Use share() to multicast changes, or unsubscribe the current subscription.'
        );
      }

      observer = obs;

      return () => {
        observer = undefined;
      };
    });

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

      assign: {
        value: newState => {
          this.set(Object.assign({}, this.state, newState));
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
