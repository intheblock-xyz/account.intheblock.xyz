export function areSetsEqual(
  s1: Set<unknown>,
  s2: Set<unknown>,
  compareOrder = false,
): boolean {
  if (s1.size !== s2.size) {
    return false;
  }

  if (compareOrder) {
    const s2Arr = Array.from(s2);
    return Array.from(s1).every((value, index) => s2Arr[index] === value);
  } else {
    return Array.from(s1).every((value) => s2.has(value));
  }
}
