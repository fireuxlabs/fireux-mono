/**
 * Pure formatting and validation helpers for Professional entity.
 */
export function useProfessionalFormattingAndValidation() {
  const formatDisplayName = (v: string) =>
    v?.trim().replace(/\s+/g, ' ').slice(0, 100)
  const validateDisplayName = (v: string) => {
    const s = formatDisplayName(v)
    if (!s) return 'Display name is required'
    if (s.length < 2) return 'Display name is too short'
    return true
  }

  return {
    formatDisplayName,
    validateDisplayName,
  }
}
