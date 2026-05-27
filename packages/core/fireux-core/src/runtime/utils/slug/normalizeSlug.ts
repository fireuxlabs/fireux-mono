export type NormalizeSlugOptions = {
  maxLength?: number
  stripLeadingAt?: boolean
}

export const normalizeString = (value: unknown) => String(value ?? '').trim()

export function normalizeSlug(
  value: unknown,
  options: NormalizeSlugOptions = {}
): string {
  let candidate = normalizeString(value)
    .toLowerCase()

  if (options.stripLeadingAt !== false) {
    candidate = candidate.replace(/^@+/g, '')
  }

  candidate = candidate.replace(/\s+/g, '-')
  candidate = candidate.replace(/[^a-z0-9-]/g, '-')
  candidate = candidate.replace(/-+/g, '-')
  candidate = candidate.replace(/^-+|-+$/g, '')

  const maxLength = Number(options.maxLength)
  if (Number.isFinite(maxLength) && maxLength > 0) {
    candidate = candidate.slice(0, Math.trunc(maxLength))
    candidate = candidate.replace(/-+/g, '-')
    candidate = candidate.replace(/^-+|-+$/g, '')
  }

  return candidate
}
