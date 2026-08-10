// Routing owns stable path/key translation only. It does not decide which
// routes appear in navigation, or whether the current user may access them.
export const CONSOLE_ROOT = '/console'

export type ConsoleFamily = string

export function normalizeConsoleFamily(value: unknown): ConsoleFamily | '' {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function consoleFamilyFromPath(path: string): ConsoleFamily | '' {
  return normalizeConsoleFamily(path.match(/^\/console\/([^/]+)/)?.[1] || '')
}

export function toConsoleFamilyPath(family: ConsoleFamily | string) {
  const normalized = normalizeConsoleFamily(family) || String(family || '').trim().toLowerCase()
  return `${CONSOLE_ROOT}/${normalized}`
}

export function toConsoleFamilyLabel(key: ConsoleFamily | string) {
  return String(normalizeConsoleFamily(key) || key || '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

export function toConsoleSelectionStateKey(family: ConsoleFamily | string) {
  return `fireux_runtime_${normalizeConsoleFamily(family)}`
}
