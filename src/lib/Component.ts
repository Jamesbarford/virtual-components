import { ConcreteComponent } from "../dom/ConcreteComponent";

export interface ComponentI<Props = Dictionary<any>> {
  props?: Props;
}

export abstract class Component<Props = Dictionary<any>> implements ComponentI<Props> {
  public abstract render(): ConcreteComponent | null;
  public props?: Props;

  constructor(props?: Props) {
    if (props) {
      this.props = props;
    }
  }
}
