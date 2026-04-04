import type { ConsoleFamily } from '../../runtime/runtime.types'

export type ConsoleFamilyRoute = {
  key: ConsoleFamily
  path: string
}

export const CONSOLE_ROOT = '/console'

export const CONSOLE_FAMILIES = [
  'projects',
  'kitchen',
  'portfolio',
  'supplier',
] as const satisfies readonly ConsoleFamily[]

export function normalizeConsoleFamily(value: unknown): ConsoleFamily | '' {
  const normalized = String(value || '').trim().toLowerCase()
  return (CONSOLE_FAMILIES as readonly string[]).includes(normalized)
    ? (normalized as ConsoleFamily)
    : ''
}

export function consoleFamilyFromPath(path: string): ConsoleFamily | '' {
  return normalizeConsoleFamily(path.match(/^\/console\/([^/]+)/)?.[1] || '')
}

export function toConsoleFamilyPath(family: ConsoleFamily | string) {
  return `${CONSOLE_ROOT}/${String(family || '').trim()}`
}

export function toConsoleFamilyLabel(key: ConsoleFamily | string) {
  return key
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}
