import { useRuntimeConfig } from '#imports'

export type PlaceType = string

export function usePlaceTypesConfig(): string[] {
  const runtimeConfig = useRuntimeConfig()
  const types = (runtimeConfig.public as any)?.fireux?.places?.types
  return Array.isArray(types) ? (types as string[]) : []
}

export function toPlaceCollectionPath(_type: string | null | undefined, _types: string[]): string {
  // Canon: places are neutral and always stored under /places.
  // `type` and `types` are only used for UI/search filtering.
  return 'places'
}

export function normalizePlaceType(raw: unknown): string | null {
  if (raw == null) return null
  if (Array.isArray(raw)) return normalizePlaceType(raw[0])
  const value = String(raw).trim()
  return value ? value : null
}
