import { useRuntimeConfig } from '#imports'
import { validatePublicSlug } from '../../../../../../../utils/slug/validatePublicSlug'

const normalizeKey = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()

function getRuntimeReservedRouteKeys(): string[] {
  try {
    const rc = useRuntimeConfig() as any
    const keys = rc?.public?.fireux?.reservedRouteKeys
    return Array.isArray(keys) ? keys.map(normalizeKey).filter(Boolean) : []
  } catch {
    return []
  }
}

export function isVetoedHandle(handle: string): boolean {
  const result = validatePublicSlug(handle, {
    required: false,
    reservedScope: 'root',
    runtimeReservedRouteKeys: getRuntimeReservedRouteKeys(),
  })

  return result.reason === 'reserved'
}
