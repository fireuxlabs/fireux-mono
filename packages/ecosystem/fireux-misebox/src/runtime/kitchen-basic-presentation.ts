export const MISEBOX_BASIC_PRIMARY_COLOR = '#2563eb' as const

export type MiseboxKitchenBasicPresentationInput = {
  name: string
  slug: string
  mediaBackdropColor?: string
  placeImageUrl?: string
  logoImageUrl?: string
  wordmarkImageUrl?: string
}

export type MiseboxKitchenBasicPresentation = {
  name: string
  slug: string
  placePrimaryColor: string
  placePrimaryColorSource: 'projected' | 'misebox-default'
  placeImageSrc?: string
  logoImageSrc?: string
  wordmarkImageSrc?: string
  identityImageSrc?: string
  identityImageRole?: 'wordmark' | 'logo'
}

const text = (value: unknown) => String(value ?? '').trim()
const hexColour = (value: unknown) => {
  const colour = text(value)
  return /^#[0-9a-f]{6}$/i.test(colour) ? colour : ''
}

export function resolveMiseboxKitchenBasicPresentation(
  input: MiseboxKitchenBasicPresentationInput
): MiseboxKitchenBasicPresentation {
  const name = text(input.name)
  const slug = text(input.slug)
  if (!name || !slug) {
    throw new Error('Basic Kitchen presentation requires a canonical name and slug.')
  }

  const projectedPrimary = hexColour(input.mediaBackdropColor)
  const placeImageSrc = text(input.placeImageUrl)
  const wordmarkImageSrc = text(input.wordmarkImageUrl)
  const logoImageSrc = text(input.logoImageUrl)

  return {
    name,
    slug,
    placePrimaryColor: projectedPrimary || MISEBOX_BASIC_PRIMARY_COLOR,
    placePrimaryColorSource: projectedPrimary
      ? 'projected'
      : 'misebox-default',
    ...(placeImageSrc ? { placeImageSrc } : {}),
    ...(logoImageSrc ? { logoImageSrc } : {}),
    ...(wordmarkImageSrc ? { wordmarkImageSrc } : {}),
    ...(wordmarkImageSrc
      ? { identityImageSrc: wordmarkImageSrc, identityImageRole: 'wordmark' as const }
      : logoImageSrc
        ? { identityImageSrc: logoImageSrc, identityImageRole: 'logo' as const }
        : {}),
  }
}
