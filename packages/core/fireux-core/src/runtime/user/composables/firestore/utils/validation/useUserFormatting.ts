// FILE: packages/core/fireux-core/src/runtime/user/composables/firestore/utils/validation/useUserFormatting.ts
// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: accept only HTTPS public avatar input.
import {
  normalizeHttpsUrlInput,
  readHttpsUrl,
} from '../../../../../utils/httpsUrl'
import {
  normalizeUserHandle,
  validateUserHandleForPublicRoute,
} from '../identity/useUserHandleIdentity'
import { readUserDisplayName } from '../../../../utils/profile-validation'

const MAX_HANDLE_LENGTH = 30
const MAX_EMAIL_LENGTH = 254
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_BIO_LENGTH = 280
const MAX_AVATAR_URL_LENGTH = 2048

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

function validateEmail(raw: string) {
  const value = (raw || '').trim()
  if (!value) return { isValid: false, message: 'Email cannot be empty.' }
  if (value.length > MAX_EMAIL_LENGTH)
    return { isValid: false, message: 'Email is too long.' }
  if (!EMAIL_REGEX.test(value))
    return { isValid: false, message: 'Enter a valid email address.' }
  return { isValid: true }
}

function formatEmail(raw: string) {
  return (raw || '').trim().toLowerCase()
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

function validateAvatarUrl(raw: string | null | undefined) {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return { isValid: true }
  if (value.length > MAX_AVATAR_URL_LENGTH) {
    return {
      isValid: false,
      message: 'URL is too long.',
    }
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !readHttpsUrl(value)) {
      return {
        isValid: false,
        message: 'Use an HTTPS URL.',
      }
    }
  } catch {
    return {
      isValid: false,
      message: 'Enter a valid URL.',
    }
  }

  return { isValid: true }
}

function formatAvatarUrl(raw: string | null | undefined) {
  return normalizeHttpsUrlInput(raw, {
    label: 'Avatar URL',
    maxLength: MAX_AVATAR_URL_LENGTH,
  })
}

const DisplayName = {
  validate: validateDisplayName,
  format: formatDisplayName,
}

const Handle = {
  validate: validateHandle,
  format: formatHandle,
}

const Email = {
  validate: validateEmail,
  format: formatEmail,
}

const Bio = {
  validate: validateBio,
  format: formatBio,
}

const AvatarUrl = {
  validate: validateAvatarUrl,
  format: formatAvatarUrl,
}

export function useUserFormattingAndValidation() {
  return {
    DisplayName,
    Handle,
    Email,
    Bio,
    AvatarUrl,
  }
}
