import { normalizeString } from '../normalize-string'

export type NormalizeSlugOptions = {
  maxLength?: number
  stripLeadingAt?: boolean
}

function transliterateSlugString(value: string): string {
  return value
    .replace(/\u00c4/g, 'Ae')
    .replace(/\u00d6/g, 'Oe')
    .replace(/\u00dc/g, 'Ue')
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
    .replace(/\u00c6/g, 'Ae')
    .replace(/\u00e6/g, 'ae')
    .replace(/\u0152/g, 'Oe')
    .replace(/\u0153/g, 'oe')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function normalizeSlug(
  value: unknown,
  options: NormalizeSlugOptions = {}
): string {
  let candidate = transliterateSlugString(normalizeString(value))
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
