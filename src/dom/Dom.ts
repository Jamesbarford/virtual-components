import { ConcreteComponent } from "./ConcreteComponent";
import { StatefulComponent } from "../lib/StatefulComponent";
import { Render } from "./Render";

export class Dom {
  public static instatiateStatefulComponent(
    el: StatefulComponent,
    composeRender?: (r: Render<GenericHTML>) => void
  ): StatefulComponent {
    const rootComponent: ConcreteComponent = el.render();
    const topLevelNode: Render<GenericHTML> = Render.create(rootComponent.$$htmlTag, rootComponent.domAttr);
    const components = ConcreteComponent.composeTree(rootComponent.children, { parent: topLevelNode, children: [] });
    const flattened: ConcreteComponent[] = ConcreteComponent.renderToConcrete(components.children);

    if (composeRender) composeRender(components.parent);

    el.topLevelNode = topLevelNode;
    el.children = components.children;
    el.currentConcreteChildren = flattened;

    return el;
  }

  public static appendToDom(parentIdOrClass: string, el: StatefulComponent): void {
    const root = <HTMLElement>document.querySelector(parentIdOrClass);
    Dom.instatiateStatefulComponent(el, render => root.appendChild(render.el));
  }

  public static create<T extends HTMLElement>(el: HTMLTag): T {
    return <T>document.createElement(el);
  }
}
