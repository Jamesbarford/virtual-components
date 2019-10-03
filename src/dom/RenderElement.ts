import { ConcreteComponent, ConcreteProps } from "./ConcreteComponent";

class RenderElement {
  public static create<T extends HTMLTag>(
    tag: T,
    ...props: ConcreteProps
  ): ConcreteComponent<HTMLElementTagNameMap[T]> {
    return new ConcreteComponent<HTMLElementTagNameMap[T]>(tag, props);
  }
}

export const r = RenderElement.create;