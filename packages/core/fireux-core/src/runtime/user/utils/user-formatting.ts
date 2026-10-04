import {
  normalizeUserHandle,
  validateUserHandleForPublicRoute,
} from './user-handle'
import { readUserDisplayName } from './profile-validation'

const MAX_HANDLE_LENGTH = 30
const MAX_BIO_LENGTH = 280

function validateDisplayName(name: string) {
  try {
    readUserDisplayName(name)
    return { isValid: true }
  } catch (error) {
    return { isValid: false, message: (error as Error).message }
  }
}

function formatDisplayName(name: string) {
  const value = (name || '').trim()
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function validateHandle(raw: string) {
  const value = String(raw || '').trim()
  if (!value) return { isValid: true }
  const result = validateUserHandleForPublicRoute(value)
  return result.isValid
    ? { isValid: true }
    : { isValid: false, message: result.message }
}

function formatHandle(raw: string) {
  return normalizeUserHandle(raw).slice(0, MAX_HANDLE_LENGTH)
}

function validateBio(raw: string) {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return { isValid: true }
  if (value.length > MAX_BIO_LENGTH) {
    return {
      isValid: false,
      message: `Bio must be ${MAX_BIO_LENGTH} characters or less.`,
    }
  }
  return { isValid: true }
}

function formatBio(raw: string) {
  if (typeof raw !== 'string') return ''
  return raw.replaceAll('\r\n', '\n').trim()
}

export const USER_DISPLAY_NAME_FIELD = Object.freeze({
  validate: validateDisplayName,
  format: formatDisplayName,
})

export const USER_HANDLE_FIELD = Object.freeze({
  validate: validateHandle,
  format: formatHandle,
})

export const USER_BIO_FIELD = Object.freeze({
  validate: validateBio,
  format: formatBio,
})
