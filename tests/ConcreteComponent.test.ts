import { ConcreteComponent } from "../src/dom/ConcreteComponent";
import { mockClassMethod } from "./testUtils";

describe("ConcreteComponent", () => {
  it("should instanciate a new class with correct properties", () => {
    const mock = mockClassMethod(ConcreteComponent, "_$$findChildren");
    const concreteComponent = new ConcreteComponent("div", <any>[]);

    expect(concreteComponent.$$htmlTag).toBe("div");
    expect(concreteComponent.children).toBeUndefined();
    expect(concreteComponent.domAttr).toEqual(undefined);
    expect((concreteComponent as any)._$$hasChildren).toBe(false);
    expect(ConcreteComponent["_$$findChildren"]).toHaveBeenCalled();

    mock.restore();
  });

  it("should find children", () => {
    const concreteComponent = new ConcreteComponent("div", [
      new ConcreteComponent("span", [
        {
          className: "span"
        }
      ])
    ]);

    expect(concreteComponent.children.length).toBe(1);
    expect(concreteComponent["_$$hasChildren"]).toBe(true);
  });
});
