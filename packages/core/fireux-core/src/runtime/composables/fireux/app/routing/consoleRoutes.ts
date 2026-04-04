import type { ConsoleFamily, RuntimeSelectionState } from '../../runtime/runtime.types'

export const CONSOLE_ROOT = '/console'

export function createDefaultRuntimeSelectionState(): RuntimeSelectionState {
  return {
    selectedId: '',
    mode: 'read-only',
  }
}

export function normalizeConsoleFamily(value: unknown): ConsoleFamily | '' {
  return String(value || '').trim().toLowerCase()
}

export function consoleFamilyFromPath(path: string): ConsoleFamily | '' {
  return normalizeConsoleFamily(path.match(/^\/console\/([^/]+)/)?.[1] || '')
}

export function toConsoleFamilyPath(family: ConsoleFamily | string) {
  return `${CONSOLE_ROOT}/${normalizeConsoleFamily(family) || String(family || '').trim()}`
}

export function toConsoleFamilyLabel(key: ConsoleFamily | string) {
  return String(key || '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

export function toConsoleSelectionStateKey(family: ConsoleFamily | string) {
  return `fireux_runtime_${normalizeConsoleFamily(family)}`
}
