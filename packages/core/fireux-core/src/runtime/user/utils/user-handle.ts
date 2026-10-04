import { useRuntimeConfig } from '#imports'
import { normalizeSlug } from '../../utils/slug/normalizeSlug'
import { validatePublicSlug } from '../../utils/slug/validatePublicSlug'

const MIN_HANDLE_LENGTH = 3
const MAX_HANDLE_LENGTH = 30

const normalizeReservedHandleKey = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()

function getRegisteredReservedRouteKeys(): string[] {
  try {
    const rc = useRuntimeConfig()
    const keys = rc?.public?.fireux?.reservedRouteKeys
    return Array.isArray(keys)
      ? keys.map(normalizeReservedHandleKey).filter(Boolean)
      : []
  } catch {
    return []
  }
}

export const normalizeUserHandle = (raw: string) =>
  normalizeSlug(raw, { maxLength: MAX_HANDLE_LENGTH })

export const validateUserHandleForPublicRoute = (rawHandle: string) => {
  const result = validatePublicSlug(rawHandle, {
    required: true,
    minLength: MIN_HANDLE_LENGTH,
    maxLength: MAX_HANDLE_LENGTH,
    label: 'Handle',
    reservedScope: 'root',
    registeredReserved: getRegisteredReservedRouteKeys(),
  })

  if (!result.isValid) {
    return { isValid: false, message: result.message, handle: result.slug }
  }

  return { isValid: true, handle: result.slug }
}
