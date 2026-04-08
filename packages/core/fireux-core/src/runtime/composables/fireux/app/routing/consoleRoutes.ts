import type {
  ConsoleFamily,
  ConsoleSelectionState,
} from '../../console/console.types'

export const CONSOLE_ROOT = '/console'

export function createDefaultConsoleSelectionState(): ConsoleSelectionState {
  return {
    selectedId: '',
    mode: 'live',
  }
}

export function normalizeConsoleFamily(value: unknown): ConsoleFamily | '' {
  return String(value || '')
    .trim()
    .toLowerCase()
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

export function toConsoleHeaderStateKey(family: ConsoleFamily | string) {
  return `${toConsoleSelectionStateKey(family)}_header`
}
