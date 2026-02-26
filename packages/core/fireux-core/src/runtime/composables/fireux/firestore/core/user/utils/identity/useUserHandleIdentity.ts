import { isVetoedHandle } from './handleVeto'

const MIN_HANDLE_LENGTH = 3
const MAX_HANDLE_LENGTH = 30
const HANDLE_PATTERN = /^[a-z0-9-]+$/

export const normalizeUserHandle = (raw: string) => {
  let candidate = String(raw || '')
    .trim()
    .toLowerCase()
  candidate = candidate.replace(/^@+/g, '')
  candidate = candidate.replace(/\s+/g, '-')
  candidate = candidate.replace(/[^a-z0-9-]/g, '')
  candidate = candidate.replace(/-+/g, '-')
  candidate = candidate.replace(/^-+|-+$/g, '')
  return candidate.slice(0, MAX_HANDLE_LENGTH)
}

export const isReservedUserHandle = (handle: string) =>
  isVetoedHandle(handle)

export const validateUserHandleForPublicRoute = (rawHandle: string) => {
  const handle = normalizeUserHandle(rawHandle)
  if (!handle) return { isValid: false, message: 'Handle cannot be empty.', handle }
  if (handle.length < MIN_HANDLE_LENGTH) {
    return { isValid: false, message: 'Handle too short.', handle }
  }
  if (handle.length > MAX_HANDLE_LENGTH) {
    return { isValid: false, message: 'Handle too long.', handle }
  }
  if (!HANDLE_PATTERN.test(handle)) {
    return {
      isValid: false,
      message: 'Use lowercase letters, numbers, and dashes only.',
      handle,
    }
  }
  if (isReservedUserHandle(handle)) {
    return { isValid: false, message: 'This handle is already in use.', handle }
  }
  return { isValid: true, handle }
}
