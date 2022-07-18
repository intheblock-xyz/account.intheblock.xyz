import every from "lodash/every";

export function hasAll<
  C = Record<string, unknown> | unknown[],
  V extends unknown[] = unknown[],
>(collection: C, values: V): boolean {
  if (Array.isArray(collection)) {
    return every(values.map((value) => collection.includes(value)));
  } else {
    const keys = Object.keys(collection);
    return every(values.map((value) => keys.includes(String(value))));
  }
}
