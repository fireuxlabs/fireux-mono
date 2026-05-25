import {
  validatePublicSlug,
  type ValidatePublicSlugOptions,
} from '../../../utils/slug/validatePublicSlug.ts'

export type PublicSlugAvailabilityStatus = {
  slug: string
  available: boolean
  taken: boolean
  isValid: boolean
  message?: string
  reason?: 'format' | 'reserved' | 'taken'
}

export type CheckPublicSlugAvailabilityOptions = ValidatePublicSlugOptions & {
  exists: (slug: string) => boolean | Promise<boolean>
  takenMessage?: string
}

export async function checkPublicSlugAvailability(
  value: unknown,
  options: CheckPublicSlugAvailabilityOptions
): Promise<PublicSlugAvailabilityStatus> {
  const result = validatePublicSlug(value, options)

  if (!result.isValid) {
    return {
      slug: result.slug,
      available: false,
      taken: false,
      isValid: false,
      message: result.message,
      reason: result.reason,
    }
  }

  const taken = await options.exists(result.slug)

  return {
    slug: result.slug,
    available: !taken,
    taken,
    isValid: true,
    message: taken
      ? options.takenMessage || `${options.label || 'Slug'} "${result.slug}" is already taken.`
      : undefined,
    reason: taken ? 'taken' : undefined,
  }
}
