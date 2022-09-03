import { localStorageLoad, localStorageSave } from "@/lib/localStorage";

const LS_IS_SIGNED_IN_KEY = "isSignedIn";

export function saveIsSignedIn(isSignedIn: boolean): void {
  localStorageSave<boolean>(LS_IS_SIGNED_IN_KEY, isSignedIn);
}

export function loadIsSignedIn(): boolean {
  return localStorageLoad<boolean>(LS_IS_SIGNED_IN_KEY) || false;
}
