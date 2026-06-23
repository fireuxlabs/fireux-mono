import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../composables/fireux/public/menu/useMenuManifest'

// Structured menu component spine: item/section display types come from useMenuManifest so detail rendering stays aligned with the manifest contract.
export type MenuStructuredItem = MenuManifestItem
export type MenuStructuredSection = MenuManifestSection
