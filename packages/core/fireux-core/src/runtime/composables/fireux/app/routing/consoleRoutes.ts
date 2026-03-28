export type ConsoleChildRoute = {
  key: string
  path: string
}

export const CONSOLE_ROOT = '/console'

export function toConsoleScopeLabel(key: string) {
  return key
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}
