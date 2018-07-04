export default class Controller {
  constructor(state) {
    this._state = state;
  }

  getState() {
    return this._state.get();
  }

  changes() {
    return this._state.changes();
  }

  _updateState(value) {
    this._state.update(value);
  }
}
