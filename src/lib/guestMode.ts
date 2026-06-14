export const GUEST_MODE_STORAGE_KEY = "vexora_guest_mode";

/** App entry with guest flag — sets guest mode on first load. */
export const GUEST_APP_HREF = "/app?guest=1";

export function readGuestMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(GUEST_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeGuestMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) window.localStorage.setItem(GUEST_MODE_STORAGE_KEY, "1");
    else window.localStorage.removeItem(GUEST_MODE_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

export function guestHref(path = "/app"): string {
  const base = path.startsWith("/") ? path : `/${path}`;
  return `${base}${base.includes("?") ? "&" : "?"}guest=1`;
}
