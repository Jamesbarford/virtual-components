import * as u from "../src/lib/util";

describe("utliity functions", () => {
  describe("isArray", () => {
    it("should return true if type is an array", () => {
      const arr: unknown[] = [];

      expect(u.isArray(arr)).toBe(true);
    });

    it("should return false if value is not an array", () => {
      const str = "";

      expect(u.isArray(str)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should return true if type is an object or class", () => {
      const obj: Dictionary<any> = {};

      class Example {}

      const exampleClass = new Example();

      expect(u.isObject(exampleClass)).toBe(true);
      expect(u.isObject(obj)).toBe(true);
    });

    it("should return false if value is not an object", () => {
      const str = "";
      const fn = (): void => undefined;
      const num = 8;
      const arr: unknown[] = [];

      expect(u.isObject(undefined)).toBe(false);
      expect(u.isObject(null)).toBe(false);
      expect(u.isObject(arr)).toBe(false);
      expect(u.isObject(fn)).toBe(false);
      expect(u.isObject(num)).toBe(false);
      expect(u.isObject(str)).toBe(false);
    });
  });

  describe("ensureType", () => {});

  describe("forEachObj", () => {});

  describe("mapObject", () => {});

  describe("reduceObj", () => {});

  describe("isEqualObj", () => {});

  describe("forEachArray", () => {});

  describe("mapArray", () => {});

  describe("recurseArray", () => {});

  describe("flattenArray", () => {});

  describe("filterArray", () => {});

  describe("keyBy", () => {});

  describe("reduceArray", () => {});

  describe("clone", () => {});

  describe("uuid", () => {});

  describe("hashCode", () => {});
});
