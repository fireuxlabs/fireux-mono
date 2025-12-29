import { useRuntimeConfig } from '#imports'

export type PlaceType = string

export function usePlaceTypesConfig(): string[] {
  const runtimeConfig = useRuntimeConfig()
  const types = (runtimeConfig.public as any)?.fireux?.places?.types
  return Array.isArray(types) ? (types as string[]) : []
}

export function toPlaceCollectionPath(type: string | null | undefined, types: string[]): string {
  if (!type) return 'places'
  if (type === 'other') return 'places'
  if (!types.includes(type)) return 'places'
  if (type === 'company') return 'companies'
  return `${type}s`
}

export function normalizePlaceType(raw: unknown): string | null {
  if (raw == null) return null
  if (Array.isArray(raw)) return normalizePlaceType(raw[0])
  const value = String(raw).trim()
  return value ? value : null
}
