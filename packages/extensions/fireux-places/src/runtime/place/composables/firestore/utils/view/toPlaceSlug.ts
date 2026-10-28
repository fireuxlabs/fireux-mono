import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'

/**
 * Generate the default public locator from the place name.
 * The stored Place id remains canonical; slug is a clean public URL key.
 *
 * Examples:
 *   toPlaceSlug('La Tap Berne')     -> 'la-tap-berne'
 *   toPlaceSlug('Cafe du Soleil')   -> 'cafe-du-soleil'
 */
export function toPlaceSlug(name: string): string {
  return normalizeSlug(name)
}
