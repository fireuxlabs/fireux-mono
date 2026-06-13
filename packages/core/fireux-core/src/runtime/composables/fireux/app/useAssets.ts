import { resolveFireuxBrandAssets } from '../../../../utils/brandAssets'

const appAssets = Object.freeze(resolveFireuxBrandAssets())

/**
 * Standard FireUX app asset paths.
 *
 * These are fixed public asset conventions, not app-authored config.
 * Stored app media remains separate truth under apps/{appId}.media.
 */
export function useAssets() {
  return appAssets
}
