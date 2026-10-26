// Small wrappers around localStorage. Storage can be blocked (private windows, school
// device policies), so every call is guarded and the site still works without it.

export function load(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function save(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  const raw = load(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown) {
  save(key, JSON.stringify(value))
}
