// Routing owns stable path/key translation only. It does not decide which
// routes appear in navigation, or whether the current user may access them.
export const CONSOLE_ROOT = '/console'

export type ConsoleFamily = string

const CONSOLE_FAMILY_ALIASES: Record<string, string> = {
  project: 'project',
  projects: 'project',
  property: 'property',
  properties: 'property',
  kitchen: 'kitchen',
  kitchens: 'kitchen',
  portfolio: 'portfolio',
  portfolios: 'portfolio',
  supplier: 'supplier',
  suppliers: 'supplier',
}

const CONSOLE_FAMILY_ROUTE_SEGMENTS: Record<string, string> = {
  project: 'project',
  property: 'property',
  kitchen: 'kitchen',
  portfolio: 'portfolio',
  supplier: 'supplier',
}

export function normalizeConsoleFamily(value: unknown): ConsoleFamily | '' {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  return CONSOLE_FAMILY_ALIASES[normalized] || normalized
}

export function consoleFamilyFromPath(path: string): ConsoleFamily | '' {
  return normalizeConsoleFamily(path.match(/^\/console\/([^/]+)/)?.[1] || '')
}

export function toConsoleFamilyPath(family: ConsoleFamily | string) {
  const normalized = normalizeConsoleFamily(family) || String(family || '').trim().toLowerCase()
  const routeSegment = CONSOLE_FAMILY_ROUTE_SEGMENTS[normalized] || normalized

  return `${CONSOLE_ROOT}/${routeSegment}`
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

export function toConsoleHeaderStateKey(family: ConsoleFamily | string) {
  return `${toConsoleSelectionStateKey(family)}_header`
}
