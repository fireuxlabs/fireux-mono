// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUserFormattingAndValidation.ts
const MIN_DISPLAY_NAME_LENGTH = 2
const MAX_DISPLAY_NAME_LENGTH = 60
const MIN_HANDLE_LENGTH = 3
const MAX_HANDLE_LENGTH = 30

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

export function useUserFormattingAndValidation() {
  return {
    validateDisplayName,
    formatDisplayName,
    validateHandle,
    formatHandle,
  }
}
