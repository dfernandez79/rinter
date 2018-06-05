import { Observable, BehaviorSubject, merge, empty } from 'rxjs';
import { map, filter, switchMap, distinctUntilChanged } from 'rxjs/operators';

import mapValues from 'lodash/mapValues';
import transform from 'lodash/transform';
import isFunction from 'lodash/isFunction';

export class AbstractState {
  constructor(subject, changes) {
    this._subject = subject;
    this._changes = changes;
  }

  get value() {
    return this._subject.getValue();
  }

  set value(newValue) {
    this._subject.next(newValue);
  }

  get changes() {
    return this._changes;
  }

  update(fn) {
    this.value = fn(this.value);
  }
}

export default class State extends AbstractState {
  static create(initialValue) {
    return new State(initialValue);
  }
  constructor(initialValue) {
    const subject = new BehaviorSubject(initialValue);
    super(subject, subject.pipe(distinctUntilChanged()));
  }
}

function createChildren(factories, initialValue) {
  return mapValues(
    factories,
    (factory, key) =>
      isFunction(factory)
        ? factory(initialValue[key])
        : new CompositeState(factory, initialValue[key])
  );
}

export class CompositeState extends AbstractState {
  constructor(factories, initialValue) {
    const subject = new BehaviorSubject(initialValue);
    const silent = new BehaviorSubject(false);

    super(subject, silent.pipe(switchMap(v => (v ? empty() : subject))));

    this.children = createChildren(factories, initialValue);
    this._silent = silent;

    merge(
      ...transform(
        this.children,
        (observables, child, key) => {
          observables.push(
            child.changes.pipe(filter(v => this.value[key] !== v))
          );
        },
        []
      )
    )
      .pipe(map(() => mapValues(this.children, c => c.value)))
      .subscribe(subject);
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
