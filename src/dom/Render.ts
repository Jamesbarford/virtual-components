import { forEachObj, uuid, forEachArray } from "../lib/util";
import { Dom } from "./Dom";

interface RenderI {
  domAttr: DomAttr;
  $$htmlTag: HTMLTag;
  id: string;
  assignId(): void;
  hasChildren(): boolean;
  setDomAttr(domAttr: DomAttr): void;
  appendChild(element: Render<GenericHTML>): GenericHTML | undefined;
  replace($$htmlTag: HTMLTag, newDomAttr: DomAttr): void;
}

/**
 * @class Render
 *
 * a wrapper for `HTMLElements`, making setting properties easier
 *
 * has a static helper to make creating them easier
 *
 * __@method `public static create`
 * @param htmlTag: tag name of element
 * @param domAttr: `styles`, `events` and other `attr`
 * @returns a `new Render`
 */
export class Render<El extends HTMLElement> implements RenderI {
  public domAttr: DomAttr = {};
  public $$htmlTag: HTMLTag;
  public id: string;

  private constructor(public el: El, domAttr?: DomAttr) {
    this.$$htmlTag = <HTMLTag>el.localName;
    if (domAttr) {
      this.domAttr = domAttr;
      this.setDomAttr(domAttr);
    }
  }

  public assignId(): void {
    if (!this.id) {
      this.id = uuid();
    }
  }

  public hasChildren(): boolean {
    return this.el.hasChildNodes();
  }

  public setDomAttr(domAttr: DomAttr): void {
    if (!domAttr) return;
    this.domAttr = domAttr;

    forEachObj(domAttr, (key, prop) => {
      if (key in this.el) {
        if (key === "style") {
          this.$$setStyles(prop);
        } else if (prop !== undefined) {
          (<any>this.el)[key] = prop;
        }
      } else {
        console.warn(`${key} is not a valid property of a ${this.el.tagName}`);
      }
    });
  }

  public appendChild(element: Render<El>): El | undefined {
    if (!element) return undefined;
    this.el.appendChild(element.el);
    return this.el;
  }

  public replace($$htmlTag: HTMLTag, newDomAttr: DomAttr): void {
    // Could instaciate a `new Render` seems pointless... but perhaps safer?
    // TODO: when this blows up 💥... replace it.
    const el = Dom.create($$htmlTag);

    this.$$htmlTag = $$htmlTag;
    this.el.replaceWith(el);
    this.el = <El>el;
    this.setDomAttr(newDomAttr);
  }

  // creates `Render` instances
  public static create(htmlTag: HTMLTag, domAttr?: DomAttr): Render<GenericHTML> {
    return new Render(Dom.create(htmlTag), domAttr);
  }

  public static createRenderMap(renderArr: Render<GenericHTML>[]): Map<string, Render<GenericHTML>> {
    const map: Map<string, Render<GenericHTML>> = new Map();
    forEachArray(renderArr, render => {
      map.set(render.id, render);
    });
    return map;
  }

  private $$setStyles(styles: CSSStyleDeclaration): void {
    if (!styles) {
      this.el.removeAttribute("style");
      return;
    }

    forEachObj(styles, (styleName: any, style) => {
      if (styleName in this.el.style) {
        this.el.style[styleName] = style;
      } else {
        console.warn(`${styleName} is not a valid style`);
      }
    });
  }
}
