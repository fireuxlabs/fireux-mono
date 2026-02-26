// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/useUserFormattingAndValidation.ts
import { isReservedUserHandle } from '../identity/useUserHandleIdentity'

const MIN_DISPLAY_NAME_LENGTH = 2
const MAX_DISPLAY_NAME_LENGTH = 60
const MIN_HANDLE_LENGTH = 3
const MAX_HANDLE_LENGTH = 30
const MAX_EMAIL_LENGTH = 254
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_BIO_LENGTH = 280
const MAX_AVATAR_URL_LENGTH = 2048

function validateDisplayName(name: string) {
  const value = (name || '').trim()
  if (!value) return { isValid: false, message: 'Name cannot be empty.' }
  if (value.length < MIN_DISPLAY_NAME_LENGTH)
    return { isValid: false, message: 'Name is too short.' }
  if (value.length > MAX_DISPLAY_NAME_LENGTH)
    return { isValid: false, message: 'Name is too long.' }
  return { isValid: true }
}

function formatDisplayName(name: string) {
  const value = (name || '').trim()
  return value
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

function validateHandle(raw: string) {
  const value = String(raw || '').trim()
  if (!value) return { isValid: true }
  const normalized = value.toLowerCase()
  if (normalized.length < MIN_HANDLE_LENGTH)
    return { isValid: false, message: 'Handle too short.' }
  if (normalized.length > MAX_HANDLE_LENGTH)
    return { isValid: false, message: 'Handle too long.' }
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return {
      isValid: false,
      message: 'Use lowercase letters, numbers, and dashes only.',
    }
  }
  if (isReservedUserHandle(normalized)) {
    return { isValid: false, message: 'This handle is already in use.' }
  }
  return { isValid: true }
}

function formatHandle(raw: string) {
  let candidate = String(raw || '')
    .trim()
    .toLowerCase()
  candidate = candidate.replaceAll(/^@+/g, '')
  candidate = candidate.replaceAll(/\s+/g, '-')
  candidate = candidate.replaceAll(/[^a-z0-9-]/g, '')
  candidate = candidate.replaceAll(/-+/g, '-')
  candidate = candidate.replaceAll(/^-|-$|_/g, '')
  return candidate.slice(0, MAX_HANDLE_LENGTH)
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
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        message: 'Use an http or https URL.',
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
  if (typeof raw !== 'string') return ''
  return raw.trim()
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
