import castArray from "lodash/castArray";

export type TLocalStorageKey = string | string[];

const LS_APP_KEY = "dispersal-tool";
const LS_KEY_DELIMITER = "/";

function getKey(key: TLocalStorageKey): string {
  return [LS_APP_KEY, ...castArray(key)].join(LS_KEY_DELIMITER);
}

export function localStorageLoad<T = unknown>(key: TLocalStorageKey): T | null {
  return JSON.parse(window.localStorage.getItem(getKey(key)) || "null");
}

export function localStorageSave<T = unknown>(
  key: TLocalStorageKey,
  value: T,
): void {
  window.localStorage.setItem(getKey(key), JSON.stringify(value));
}

export function localStorageRemove(key: string): void {
  window.localStorage.removeItem(getKey(key));
}

export function localStorageClear(): void {
  window.localStorage.clear();
}
