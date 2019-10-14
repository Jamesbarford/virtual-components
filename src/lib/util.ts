export function isNil(arg: any): boolean {
  if (arg === undefined || arg === null) return true;
  return false;
}

export function isArray<T>(arr: any, warn: boolean = process.env.NODE_ENV === "development"): arr is T[] {
  if (isNil(arr) || !Array.isArray(arr)) {
    if (warn) {
      console.warn(`${JSON.stringify(arr)} of type ${isNil(arr) ? arr : arr.constructor.name} is not a valid array`);
    }
    return false;
  }
  return true;
}

export function isObject<O>(o: any, warn: boolean = process.env.NODE_ENV === "development"): o is Dictionary<O> {
  if (isNil(o) || typeof o !== "object" || isArray(o, false)) {
    if (warn) {
      console.warn(`${JSON.stringify(o)} of type ${isNil(o) ? o : o.constructor.name} is not a valid object`);
    }
    return false;
  }
  return true;
}

export function ensureType<T>(o: T, cb: (o: T) => boolean): o is T {
  if (cb(o)) return true;
  return false;
}

export function forEachObj<T>(o: T, cb: (key: string, currVal: any, i: number) => void): void {
  if (!isObject(o)) return;

  const keys: string[] = Object.keys(o);
  if (!keys.length) return;

  let i: number = 0;
  while (keys.length > i) {
    cb(keys[i], o[keys[i]], i);
    i++;
  }
}

export function mapObject<T, V>(o: Dictionary<T>, cb: (key: string, prop: T, i: number) => V): V[] {
  if (!isObject(o)) return;

  const keys: string[] = Object.keys(o);
  if (!keys.length) return;

  const arr: V[] = [];
  let i: number = 0;

  while (keys.length > i) {
    arr.push(cb(keys[i], o[keys[i]], i));
    i++;
  }
  return arr;
}

export function reduceObj<T, V>(
  o: T,
  cb: (returnVal: V, currKey: string, currVal: any, i: number) => any,
  returnVal: V
): V {
  if (!isObject(o)) return;

  const keys: string[] = Object.keys(o);

  return reduceArray(
    keys,
    (acc, cur, i) => {
      cb(acc, cur, o[cur], i);
      return acc;
    },
    returnVal
  );
}

function removeWhiteSpace(str: string): string {
  return str.replace(/\s/g, "");
}

export function isEqualObj<T = any>(o: Dictionary<T>, o2: Dictionary<T>): boolean {
  isObject(o);
  isObject(o2);
  return reduceObj(
    o,
    (bool: boolean, currentKey: string) => {
      if (!o[currentKey] || !o2[currentKey]) return bool;
      if (removeWhiteSpace(o[currentKey].toString()) === removeWhiteSpace(o2[currentKey].toString())) {
        bool = true;
      }
      return bool;
    },
    false
  );
}

export function forEachArray<T>(arr: T[], cb: (val: T, i: number) => void): void {
  if (!isArray(arr)) return;
  return arr.forEach(cb);
}

export function mapArray<T, V>(arr: T[], cb: (val: T, i: number) => V): V[] {
  if (!isArray(arr)) return [];
  return arr.map(cb);
}

export function recurseArray<T extends T[], V>(
  arr: T,
  cb: (returnVal: V, currVal: T, i: number) => any,
  returnVal: V
): V {
  if (!isArray(arr)) return;

  let i: number = 0;
  while (arr.length > i) {
    if (isArray(arr[i])) {
      recurseArray(arr[i], cb, returnVal);
    } else {
      cb(returnVal, arr[i], i);
    }
    i++;
  }
  return returnVal;
}

export function flattenArray<T extends T[], V>(...arr: T[]): V[] {
  if (!isArray(arr)) return;
  return recurseArray(
    arr,
    (rv, curr) => {
      rv.push(curr);
      return rv;
    },
    []
  );
}

export function filterArray<T>(arr: T[], cb: (val: T, i: number) => boolean): T[] {
  if (!isArray(arr)) return;
  return arr.filter(cb);
}

export function keyBy<T>(iterable: (Dictionary<T> | T)[], property: string): Dictionary<T> {
  return reduceArray(
    iterable,
    (acc, val) => {
      if (isObject(val)) return Object.assign(acc, { [`${[val[property]]}`]: val });
      return Object.assign(acc, { [`${val}`]: val });
    },
    {}
  );
}

export function reduceArray<T, V>(arr: T[], cb: (returnVal: V, currVal: T, i: number) => any, returnVal: V): V {
  if (!isArray(arr)) return;
  return arr.reduce((rv, currVal, i): V => {
    cb(rv, currVal, i);
    return rv;
  }, returnVal);
}

export function clone<T>(o: T): T {
  if (isArray(o, false)) {
    return (<any>mapArray(o, arr => (isArray(arr) ? clone(arr) : arr))) as T;
  } else if (isObject(o, false)) {
    return Object.assign({}, o);
  } else {
    throw Error(`${JSON.stringify(o)} of type ${typeof o} is not cloneable`);
  }
}

export function uuid(): string {
  if (!("crypto" in window)) {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c =>
      c === "x" ? ((Math.random() * 16) | 0).toString(16) : ((Math.random() * 16) | (0 & 0x3) | 0x8).toString(16)
    );
  }

  return (<any>[1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
  );
}

export function noop(..._args: []): void {
  return void 0;
}
