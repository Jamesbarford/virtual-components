import { reduceArray, ensureType, mapArray, isArray } from "../lib/util";
import { Render } from "./Render";
import { StatefulComponent } from "../lib/StatefulComponent";
import { Dom } from "./Dom";

export type ConcreteProps<T extends HTMLTag = HTMLTag> =
  | [DomAttr<T>, ...(ConcreteComponent | StatefulComponent)[]]
  | undefined;

type ParentChildDict = {
  parent: Render<GenericHTML>;
  children: Render<GenericHTML>[];
};

interface ConcreteComponentI<El extends HTMLElement = any> {
  domAttr: DomAttr;
  $$htmlTag: HTMLTag;
  children?: (StatefulComponent | ConcreteComponent<El>)[];
  id?: string;
}


export class ConcreteComponent<El extends HTMLElement = any> implements ConcreteComponentI<El> {
  public domAttr: DomAttr;
  public $$htmlTag: HTMLTag;
  public children?: (StatefulComponent | ConcreteComponent<El>)[];
  public id?: string;
  private _$$hasChildren: boolean;
  // private _$$childrenDepth: number;

  constructor($$htmlTag: HTMLTag, props: ConcreteProps) {
    this.$$htmlTag = $$htmlTag;
    this.domAttr = ConcreteComponent.findDomAttr(props);
    this.children = ConcreteComponent._$$findChildren(props);
    this._$$hasChildren = this.children ? true : false;
    // this._$$childrenDepth = this._$$hasChildren ? this.children.length : undefined;
  }

  private static _$$findChildren(props: ConcreteProps): (StatefulComponent | ConcreteComponent)[] | undefined {
    if (!props) return undefined;
    const children = reduceArray(
      props,
      (rv: (StatefulComponent | ConcreteComponent)[], val) => {
        if (ConcreteComponent.isConcreteComponent(val) || ConcreteComponent.isStatefulComponent(val)) {
          rv.push(val);
        } else {
          return undefined;
        }
        return val;
      },
      []
    );
    return children.length ? children : undefined;
  }

  /**
   *
   * @param c `Array` of either `StatefulComponent | ConcreteComponent`
   * @param parentChildDict a simple dictionary of one parent to an `Array` of `Render` children
   *
   * recusively drills through the children of a `ConcreteComponent` and instiates them to a `Render`
   *
   * internally the children are connected to the `ancestor`, if a `child` has `children` then the `children`
   * are connected to the new `parent` which inturn is appended to the `ancestor`.
   *
   * @returns an object with one parent and all of its children flattened.
   *
   * @example
   * const topLevelNode: ConcreteComponent;
   * const domParent: Render<GenericHTML>; `the first `
   *
   * ConcreteComponent.composeTree(topLevelNode.children, { ancestor: domParent, children: [] })
   *
   *
   * @returns
   * ```
   * {
   * "parent": {
   * "domAttr": {
   *     "className": "top-div"
   *   },
   *   "el">: div.top-div,
   *   "$$htmlTag": "div",
   *   "id": "div-2"
   * },
   * "children": [
   *   {
   *     "domAttr": {
   *       "textContent": "hey",
   *       "className": "button"
   *     },
   *     "el">: button.button, -> `its parentElement attr will be` div.top-div
   *     "$$htmlTag": "button",
   *     "id": "button-0"
   *   }
   *```
   * internally the tree produces the following mark up, with required `DomAttr` i.e `class` `onclick` etc..,
   * all connected to the parent
   *
   * but they all are indivdually avalible in the child array and a mutation on a child will be reflected on the parent
   * as internally they are individual instances of what has been attached to the parent
   *
   * ```
   * html
   * <div class="top-div">
   *    <button class="button">hey</button>
   * </div>
   * ```
   */
  public static composeTree(c: (StatefulComponent | ConcreteComponent)[], parentChildDict: ParentChildDict) {
    return reduceArray(
      c,
      (parentChildDict, child, i) => {
        if (ConcreteComponent.isStatefulComponent(child)) {
          const component = Dom.instatiateStatefulComponent(child);
          // TODO: ID
          const id = `${parentChildDict.parent.$$htmlTag}-${i}`;
          parentChildDict.parent.id = id;
          parentChildDict.parent.appendChild(component.topLevelNode);
          return;
        }
        const childRender = Render.create(child.$$htmlTag, child.domAttr);
        const id = `${childRender.$$htmlTag}-${i}`;
        // TODO:  ID
        childRender.id = id;
        parentChildDict.parent.appendChild(childRender);
        parentChildDict.children.push(childRender);
        if (child._$$hasChildren) {
          const id = `${parentChildDict.parent.$$htmlTag}-${i}`;
          // TODO:  ID
          parentChildDict.parent.id = id;
          parentChildDict.parent.appendChild(
            ConcreteComponent.composeTree(child.children, { parent: childRender, children: parentChildDict.children })
              .parent
          );
        }
        return parentChildDict;
      },
      parentChildDict
    );
  }

  // Light Weight flatten
  public static renderToConcrete(components: Render<GenericHTML>[]): ConcreteComponent[] {
    return mapArray(components, render => {
      const concreteComponent = new ConcreteComponent(render.$$htmlTag, [render.domAttr]);

      if (render.el.children.length) {
        concreteComponent._$$hasChildren = true;
        // concreteComponent._$$childrenDepth = render.el.children.length;
      }

      return concreteComponent;
    });
  }

  /**
   * @param c Array of `(StatefulComponent | ConcreteComponent)`
   *
   * retruns a flattened array of all children as ConcreteComponents.
   * used on re-renders so its easy to get the updated `DomAttr`
   *
   * TODO: find a better way of doing / removing this. Maybe render to have 1 layer of caching?
   */
  public static flatten(c: (StatefulComponent | ConcreteComponent)[]): ConcreteComponent[] {
    return reduceArray(
      c,
      (concreteArr: ConcreteComponent[], child: ConcreteComponent, i) => {
        // if(!child.children) return concreteArr;
        // if it is stateful it is assumed it will have its own children to render,
        // this means that each component is responsible for returning and maintaining its children.
        if (ConcreteComponent.isStatefulComponent(child)) {
          return concreteArr;
        }
        // TODO: somehow a unique id needs to be maintained across renders 🤔
        child.id = `${child.$$htmlTag}-${i}`;
        concreteArr.push(child);
        if (isArray(child.children)) {
          concreteArr.push(...ConcreteComponent.flatten(child.children));
        } else {
          child._$$hasChildren = false;
          return concreteArr;
        }
        return concreteArr;
      },
      []
    );
  }

  public static isConcreteComponent(c: any): c is ConcreteComponent {
    return ensureType(c, p => p instanceof ConcreteComponent);
  }

  public static isDomAttr(r: DomAttr | ConcreteComponent): r is DomAttr {
    return ensureType(r, p => !(p instanceof ConcreteComponent));
  }

  public static isStatefulComponent(c: any): c is StatefulComponent {
    return ensureType(c, p => p instanceof StatefulComponent);
  }

  public static findDomAttr(prop: ConcreteProps): DomAttr | undefined {
    if (!prop) return;
    if (ConcreteComponent.isDomAttr(prop[0])) return prop[0];
    return undefined;
  }
}