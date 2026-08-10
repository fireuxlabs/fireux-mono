export type PlaceAssetRequirement = {
  key: 'image' | 'cover' | 'gallery' | 'logo' | 'wordmark'
  label: string
  storagePath: string
  requirements: string
  aspectRatio: 'square' | 'wide' | 'wordmark'
  multiple: boolean
  dimensions: {
    requiredWidth?: number
    requiredHeight?: number
    minWidth?: number
    minHeight?: number
    aspectRatio?: number
    minAspectRatio?: number
    aspectTolerance?: number
  }
}

/** Place-owned upload targets and the source sizes optimized by its surfaces. */
export const PLACE_ASSET_REQUIREMENTS = [
  {
    key: 'image',
    label: 'Place image',
    storagePath: 'places/{placeId}/image',
    requirements: 'At least 1024 × 1024 px with a 1:1 aspect ratio. PNG or JPEG.',
    aspectRatio: 'square',
    multiple: false,
    dimensions: {
      minWidth: 1024,
      minHeight: 1024,
      aspectRatio: 1,
      aspectTolerance: 0.01,
    },
  },
  {
    key: 'cover',
    label: 'Cover image',
    storagePath: 'places/{placeId}/cover',
    requirements: 'At least 1280 × 720 px with a 16:9 aspect ratio. PNG or JPEG.',
    aspectRatio: 'wide',
    multiple: false,
    dimensions: {
      minWidth: 1280,
      minHeight: 720,
      aspectRatio: 16 / 9,
      aspectTolerance: 0.01,
    },
  },
  {
    key: 'gallery',
    label: 'Gallery images',
    storagePath: 'places/{placeId}/gallery/{imageId}',
    requirements:
      'At least 1200 × 1200 px with a 1:1 aspect ratio. PNG or JPEG; up to 24 images.',
    aspectRatio: 'square',
    multiple: true,
    dimensions: {
      minWidth: 1200,
      minHeight: 1200,
      aspectRatio: 1,
      aspectTolerance: 0.01,
    },
  },
  {
    key: 'logo',
    label: 'Logo',
    storagePath: 'places/{placeId}/logo',
    requirements: 'Exactly 512 × 512 px (1:1). Transparent PNG.',
    aspectRatio: 'square',
    multiple: false,
    dimensions: {
      requiredWidth: 512,
      requiredHeight: 512,
      aspectRatio: 1,
      aspectTolerance: 0.01,
    },
  },
  {
    key: 'wordmark',
    label: 'Wordmark',
    storagePath: 'places/{placeId}/wordmark',
    requirements:
      'At least 256 × 64 px with an aspect ratio of at least 3:1. Transparent PNG.',
    aspectRatio: 'wordmark',
    multiple: false,
    dimensions: {
      minWidth: 256,
      minHeight: 64,
      minAspectRatio: 3,
    },
  },
] as const satisfies readonly PlaceAssetRequirement[]

export function placeAssetStoragePath(
  requirement: PlaceAssetRequirement,
  placeId: string
) {
  return requirement.storagePath.replace('{placeId}', placeId)
}

export function matchesPlaceAssetDimensions(
  requirement: PlaceAssetRequirement,
  width: number,
  height: number
) {
  const dimensions = requirement.dimensions
  if (!width || !height) return false
  if (dimensions.requiredWidth && width !== dimensions.requiredWidth) return false
  if (dimensions.requiredHeight && height !== dimensions.requiredHeight) return false
  if (dimensions.minWidth && width < dimensions.minWidth) return false
  if (dimensions.minHeight && height < dimensions.minHeight) return false

  const aspect = width / height
  if (
    dimensions.aspectRatio &&
    Math.abs(aspect - dimensions.aspectRatio) >
      (dimensions.aspectTolerance ?? 0.01)
  ) return false
  if (dimensions.minAspectRatio && aspect < dimensions.minAspectRatio) return false
  return true
}
