import { Observable } from 'rxjs';
import { Value } from './ValueHolder';

export default interface StateProvider<T extends Value> {
  getState(): T;
  changes(): Observable<T>;
}
