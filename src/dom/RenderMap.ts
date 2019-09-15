import { hashCode } from "../lib/util";

export class RenderIdMap {
  private static map: Dictionary<HTMLTag> = {};

  public static setId(val: HTMLTag): string {
    const id = `${hashCode()}`;
    RenderIdMap.map[id] = val;
    return id;
  }

  public static get(id: string): HTMLTag {
    return RenderIdMap.map[id];
  }
}
