import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

/**
 * Generate a display/search slug from a place name + short address.
 * Place route identity is id-only; this must not be used for public routing.
 *
 * Examples:
 *   toPlaceSlug('La Tap', 'Berne, Interlaken') -> 'la-tap-berne-interlaken'
 *   toPlaceSlug('Cafe du Soleil', 'Geneve')    -> 'cafe-du-soleil-geneve'
 */
export function toPlaceSlug(name: string, shortAddress?: string): string {
  const raw = [name, shortAddress].filter(Boolean).join(' ')
  return normalizeSlug(raw)
}
