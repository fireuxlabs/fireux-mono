// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserFormattingAndValidation.ts

export function useUserFormattingAndValidation() {
  function validateDisplayName(name: string) {
    const value = (name || '').trim()
    if (!value) return { isValid: false, message: 'Name cannot be empty.' }
    if (value.length < 2)
      return { isValid: false, message: 'Name is too short.' }
    if (value.length > 60)
      return { isValid: false, message: 'Name is too long.' }
    return { isValid: true }
  }

  function formatDisplayName(name: string) {
    const value = (name || '').trim()
    return value
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  }

  function validateHandle(raw: string) {
    const value = String(raw || '').trim()
    if (!value) return { isValid: true } // allow clearing
    const normalized = value.toLowerCase()
    if (normalized.length < 3)
      return { isValid: false, message: 'Handle too short.' }
    if (normalized.length > 30)
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
    let s = String(raw || '')
      .trim()
      .toLowerCase()
    s = s.replace(/^@+/, '') // drop leading @ if user typed it
    s = s.replace(/\s+/g, '-')
    s = s.replace(/[^a-z0-9-]/g, '')
    s = s.replace(/-+/g, '-')
    s = s.replace(/^-|-$|_/g, '')
    return s.slice(0, 30)
  }

  return {
    validateDisplayName,
    formatDisplayName,
    validateHandle,
    formatHandle,
  }
}
