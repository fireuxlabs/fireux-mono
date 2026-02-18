/**
 * Generate a URL-friendly slug from a place name + short address.
 *
 * Examples:
 *   toPlaceSlug('La Tap', 'Berne, Interlaken') → 'la-tap-berne-interlaken'
 *   toPlaceSlug('Café du Soleil', 'Genève')    → 'cafe-du-soleil-geneve'
 */
export function toPlaceSlug(name: string, shortAddress?: string): string {
  const raw = [name, shortAddress].filter(Boolean).join(' ')
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')    // non-alphanum → hyphen
    .replace(/^-+/, '')              // trim leading hyphens
    .replace(/-+$/, '')              // trim trailing hyphens
}

/**
 * Append a short collision suffix derived from the placeId.
 * Example: 'la-tap-berne' + 'ChIJ08WSgYSjj0cRD6oE3RwUFk0' → 'la-tap-berne-ufk0'
 */
export function toPlaceSlugWithSuffix(baseSlug: string, placeId: string): string {
  const suffix = placeId.slice(-5).toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${baseSlug}-${suffix || placeId.slice(0, 5).toLowerCase().replace(/[^a-z0-9]/g, '')}`
}
