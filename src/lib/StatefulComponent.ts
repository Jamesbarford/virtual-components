import { Render } from "../dom/Render";
import { isEqualObj, forEachArray } from "./util";
import { ConcreteComponent } from "../dom/ConcreteComponent";
import { Component, ComponentI } from "./Component";

type FunctionState<S, K extends keyof S, P> = (prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null;
type ObjectState<S, K extends keyof S> = Pick<S, K> | S | null;
export type GenericState<S, K extends keyof S, P> = FunctionState<S, K, P> | Partial<ObjectState<S, K>>;

interface StatefulComponentI<Props = Dictionary<any>> extends ComponentI<Props> {
  topLevelNode: Render<HTMLElement>;
  children: Render<HTMLElement>[];
  currentConcreteChildren: ConcreteComponent[];
}

export abstract class StatefulComponent<Props = Dictionary<any>, State = Dictionary<any>> extends Component<Props>
  implements StatefulComponentI {
  protected abstract state: State;
  public topLevelNode: Render<HTMLElement>;
  public children: Render<HTMLElement>[];
  public currentConcreteChildren: ConcreteComponent[];

  constructor(props?: Props) {
    super(props);
  }

  /**
   *
   * @param state `Object` of whatever the extended class has as state
   * @param props if there are props passed in this will accept them
   *
   * @internals:
   * ```markup
   * 1) fires render to create new concrete components
   * 2) flattens new concrete components array
   * 3) checks positions of array against the actual elements
   * 4) if there is a change the `rendered` elements will be updated by taking the new dom attr
   * 5) set `currentConcreteChildren` to the new flattened array
   * ```
   */
  public setState<K extends keyof State>(state: GenericState<State, K, DomAttr>, props?: DomAttr): void {
    if (this._stateIsFunction(state)) {
      if (isEqualObj(this.state, state(this.state, props))) return;
      Object.assign(this.state, state(this.state, props));
    } else {
      if (isEqualObj(this.state, state)) return;
      Object.assign(this.state, state);
    }

    const newConcrete = ConcreteComponent.flatten(this.render().children);
    const previousConcrete = this.currentConcreteChildren;

    // TODO: indexing by `i` seems waaayyyyy to fragile and prone to blow up
    forEachArray(newConcrete, (c, i) => {
      const previous = previousConcrete[i];
      const render = this.children[i];

      if (c.$$htmlTag !== previous.$$htmlTag) {
        render.replace(c.$$htmlTag, c.domAttr);
        return;
      }

      if (c.domAttr && !isEqualObj(c.domAttr, previous.domAttr)) {
        render.setDomAttr(c.domAttr);
        return;
      }
      return void 0;
    });

    this.currentConcreteChildren = newConcrete;
  }

  private _stateIsFunction<K extends keyof State>(
    state: GenericState<State, K, DomAttr>
  ): state is FunctionState<State, K, DomAttr> {
    if (typeof state === "function") {
      return true;
    }
    return false;
  }
}
