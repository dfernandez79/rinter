import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export default class AbstractController {
  constructor(initialState) {
    const subject = new BehaviorSubject(initialState);

    Object.defineProperties(this, {
      _subject: { value: subject },
      _changes: { value: subject.pipe(distinctUntilChanged()) },
    });
  }

  get state() {
    return this._subject.value;
  }

  get changes() {
    return this._changes;
  }

  _setState(value) {
    this._subject.next(Object.assign({}, this.state, value));
  }
}
