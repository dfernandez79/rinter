import { empty, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { mergeWith } from 'lodash';

const customMerge = (objValue, srcValue, key, object) => {
  if (objValue !== undefined && srcValue === undefined) {
    delete object[key];
  }
};

export default class AbstractController {
  constructor(initialState) {
    const subject = new BehaviorSubject(initialState);
    const changes = subject.pipe(distinctUntilChanged());
    const silent = new BehaviorSubject(false);

    Object.defineProperties(this, {
      _subject: { value: subject },
      _silent: { value: silent },
      changes: { value: silent.pipe(switchMap(v => (v ? empty() : changes))) },
    });
  }

  get state() {
    return this._subject.value;
  }

  _set(value) {
    this._subject.next(value);
  }

  _assign(value) {
    this._set(Object.assign({}, this.state, value));
  }

  _merge(value) {
    this._set(mergeWith({}, this.state, value, customMerge));
  }

  notifyLastChangeOnly(fn) {
    this._silent.next(true);
    try {
      fn();
    } finally {
      this._silent.next(false);
    }
  }
}