import { normalizeSlug } from '../../../../../../../utils/slug/normalizeSlug'
import { validateSlugFormat } from '../../../../../../../utils/slug/validateSlugFormat'
import { isVetoedHandle } from './userHandleVeto'

const MIN_HANDLE_LENGTH = 3
const MAX_HANDLE_LENGTH = 30

export const normalizeUserHandle = (raw: string) =>
  normalizeSlug(raw, { maxLength: MAX_HANDLE_LENGTH })

export const isReservedUserHandle = (handle: string) =>
  isVetoedHandle(handle)

export const validateUserHandleForPublicRoute = (rawHandle: string) => {
  const handle = normalizeUserHandle(rawHandle)
  const format = validateSlugFormat(handle, {
    required: true,
    minLength: MIN_HANDLE_LENGTH,
    maxLength: MAX_HANDLE_LENGTH,
    label: 'Handle',
  })
  if (!format.isValid) {
    return { isValid: false, message: format.message, handle }
  }
  if (isReservedUserHandle(handle)) {
    return { isValid: false, message: 'This handle is already in use.', handle }
  }
  return { isValid: true, handle }
}
