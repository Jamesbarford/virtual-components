declare type Dictionary<T> = { [key: string]: T };
declare type NumericDictionary<T> = { [key: number]: T };
/**
 * somewhat useless
 */
declare type GenericHTML<T extends HTMLElement = HTMLElement> = T;
/**
 * string of the HTML element to create:
 *
 * i.e: `div`, `span` etc..
 */
declare type HTMLTag = keyof HTMLElementTagNameMap;
/**
 * standard `HTMLElement` dom attributes, all marked as optional:
 *
 * `onclick?: any`
 * `classname?: string`
 * etc...
 */
declare type DomAttr<T extends HTMLTag = any, V extends keyof HTMLElementTagNameMap[T] = any> =
  | Partial<{ [K in keyof HTMLElementTagNameMap[T]]: V }>
  | undefined;
declare type Tuple<K, V> = [K, V];
declare type FunctionComponent<T, Props = {}> = (p: Props) => T;
