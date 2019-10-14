import { Render } from "../dom/Render";
import { isEqualObj, forEachArray, isNil, clone } from "./util";
import { ConcreteComponent } from "../dom/ConcreteComponent";
import { Component, ComponentI } from "./Component";

type FunctionState<S, K extends keyof S, P = Dictionary<any>> = (
  prevState: Readonly<S>,
  props: Readonly<P>
) => Pick<S, K> | S | null;
type ObjectState<S, K extends keyof S> = Pick<S, K> | S | null;
export type GenericState<S, K extends keyof S> = FunctionState<S, K> | Partial<ObjectState<S, K>>;

interface StatefulComponentI<Props = Dictionary<any>> extends ComponentI<Props> {
  topLevelNode: Render<HTMLElement>;
  children: Render<HTMLElement>[];
  currentConcreteChildren: ConcreteComponent[];
  setState<S, K extends keyof S>(state: Partial<GenericState<S, K>>, props?: Partial<DomAttr>): void;
}

export abstract class StatefulComponent<Props = Dictionary<any>, State = Dictionary<any>> extends Component<Props>
implements StatefulComponentI {
  protected abstract state: State;
  public componentDidUpdate?(prevProps?: Props, prevState?: State): void;
  public componentDidMount?(): void;
  public topLevelNode: Render<HTMLElement>;
  public children: Render<HTMLElement>[];
  public currentConcreteChildren: ConcreteComponent[];
  private $$renderMap: Map<string, Render<GenericHTML>>;

  constructor(props?: Props) {
    super(props);
    if(this.componentDidMount) {
      this.componentDidMount()
    }
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
  public setState<K extends keyof State>(state: GenericState<State, K>, props?: DomAttr): void {
    let prevState: State = clone(this.state);
    if (this.$$stateIsFunction(state)) {
      if (isEqualObj(this.state, state(this.state, props))) return;
      Object.assign(this.state, state(this.state, props));
    } else {
      if (isEqualObj(this.state, state)) return;
      Object.assign(this.state, state);
    }
    if(this.componentDidUpdate) {
      this.componentDidUpdate(this.props, prevState)
    }
    this.$$reRender();
  }

  private $$reRender(): void {
    if (isNil(this.$$renderMap)) {
      this.$$renderMap = Render.createRenderMap(this.children);
    }
    const newConcrete: ConcreteComponent[] = ConcreteComponent.flatten(this.render().children);

    forEachArray(newConcrete, (c, i) => {
      const previous: ConcreteComponent = this.currentConcreteChildren[i];

      if (!this.$$renderMap.has(previous.id)) return;

      const render: Render<HTMLElement> = this.$$renderMap.get(previous.id);

      c.setId(render.id);
      if (c.$$htmlTag !== previous.$$htmlTag) {
        render.replace(c.$$htmlTag, c.domAttr);
        return;
      }

      if (c.domAttr && !isEqualObj(c.domAttr, previous.domAttr)) {
        render.setDomAttr(c.domAttr);
        return;
      }
      return;
    });

    this.currentConcreteChildren = newConcrete;
  }

  private $$stateIsFunction<K extends keyof State>(state: GenericState<State, K>): state is FunctionState<State, K> {
    if (typeof state === "function") {
      return true;
    }
    return false;
  }
}
