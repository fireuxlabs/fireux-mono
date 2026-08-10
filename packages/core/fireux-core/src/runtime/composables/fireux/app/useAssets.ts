import { resolveFireuxBrandAssets } from '../../../../utils/brandAssets'

const appAssets = Object.freeze(resolveFireuxBrandAssets())

/**
 * Standard FireUX app asset paths.
 *
 * These are fixed public asset conventions, not app-authored config.
 * Stored App assets remain separate truth under apps/{appId}.assets.
 */
export function useAssets() {
  return appAssets
}
