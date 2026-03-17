const SLUG_PATTERN = /^[a-z0-9-]+$/

export type ValidateSlugFormatOptions = {
  required?: boolean
  minLength?: number
  maxLength?: number
  label?: string
}

export type ValidateSlugFormatResult = {
  isValid: boolean
  message?: string
}

export function validateSlugFormat(
  value: string,
  options: ValidateSlugFormatOptions = {}
): ValidateSlugFormatResult {
  const label = String(options.label || 'Slug').trim() || 'Slug'
  const minLengthRaw = Number(options.minLength)
  const maxLengthRaw = Number(options.maxLength)
  const minLength = Number.isFinite(minLengthRaw)
    ? Math.max(0, Math.trunc(minLengthRaw))
    : 0
  const maxLength = Number.isFinite(maxLengthRaw)
    ? Math.max(0, Math.trunc(maxLengthRaw))
    : 0

  if (!value) {
    if (options.required === false) return { isValid: true }
    return { isValid: false, message: `${label} cannot be empty.` }
  }

  if (minLength > 0 && value.length < minLength) {
    return { isValid: false, message: `${label} too short.` }
  }

  if (maxLength > 0 && value.length > maxLength) {
    return { isValid: false, message: `${label} too long.` }
  }

  if (!SLUG_PATTERN.test(value)) {
    return {
      isValid: false,
      message: 'Use lowercase letters, numbers, and dashes only.',
    }
  }

  return { isValid: true }
}