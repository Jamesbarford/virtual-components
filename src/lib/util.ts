function isNil(arg: any): boolean {
  if (arg === undefined || arg === null) return true;
  return false;
}

if (!Array.isArray) {
  Array.isArray = <T>(arg: any): arg is T[] => {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}

export function isArray<T>(arr: any, warn: boolean = process.env.NODE_ENV === "development"): arr is T[] {
  if (isNil(arr) || !Array.isArray(arr)) {
    if (warn) {
      console.warn(
        `${JSON.stringify(arr)} of type ${isNil(arr) ? arr : arr.constructor.name} is not a valid array`
      );
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

  const keys = Object.keys(o);
  if (!keys.length) return;

  let i: number = 0;
  while (keys.length > i) {
    cb(keys[i], o[keys[i]], i);
    i++;
  }
}

export function mapObject<T, V>(o: Dictionary<T>, cb: (key: string, prop: T, i: number) => V): V[] {
  if (!isObject(o)) return;

  const keys = Object.keys(o);
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

  let i: number = 0;
  const keys = Object.keys(o);

  while (keys.length > i) {
    cb(returnVal, keys[i], o[keys[i]], i);
    i++;
  }
  return returnVal;
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
  isArray(arr);

  if (arr.forEach) return arr.forEach(cb);

  let i: number = 0;
  while (arr.length > i) {
    cb(arr[i], i);
    i++;
  }
}

export function mapArray<T, V>(arr: T[], cb: (val: T, i: number) => V): V[] {
  isArray(arr);

  if (arr.map) return arr.map(cb);

  let i: number = 0;
  const newVals: V[] = [];

  while (arr.length > i) {
    newVals.push(cb(arr[i], i));
    i++;
  }
  return newVals;
}

export function recurseArray<T extends T[], V>(
  arr: T,
  cb: (returnVal: V, currVal: T, i: number) => any,
  returnVal: V
): V {
  isArray(arr);

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
  isArray(arr);
  if (arr.filter) return arr.filter(cb);

  let i: number = 0;
  const newArr: T[] = [];
  while (arr.length > i) {
    if (cb(arr[i], i)) newArr.push(arr[i]);
    i++;
  }

  return newArr;
}

export function keyBy<T>(iterable: Dictionary<any>[], property: string): Dictionary<T> {
  return reduceArray(
    iterable,
    (acc, val) => {
      return Object.assign(acc, { [val[property]]: val });
    },
    {}
  );
}

export function reduceArray<T, V>(arr: T[], cb: (returnVal: V, currVal: T, i: number) => any, returnVal: V): V {
  isArray(arr);

  if (arr.reduce) {
    return arr.reduce((rv, currVal, i): V => {
      cb(rv, currVal, i);
      return rv;
    }, returnVal);
  }

  let i: number = 0;
  while (arr.length > i) {
    cb(returnVal, arr[i], i);
    i++;
  }
  return returnVal;
}

export function clone<T>(o: T): T {
  if (isArray(o)) {
    return (<any>mapArray(o, arr => (isArray(arr) ? clone(arr) : arr))) as T;
  } else if (isObject(o)) {
    return Object.assign({}, o);
  } else {
    throw Error(`${JSON.stringify(o)} of type ${typeof o} is not cloneable`);
  }
}

export function uuid(str?: string): string {
  return `${str ? str + "-" : ""}${(Date.now() + Math.floor(Math.random() * 1000)).toString()}`;
}

export const hashCode = (str?: string): number => {
  const id = str ? str : uuid();
  let hash: number = 0;
  let i: number = id.length;
  let chr: number;
  if (i === 0) return hash;
  while (i--) {
    chr = id.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};
