import { useKitchenAssetUpdate } from './useKitchenAssetUpdate'

/** @deprecated Prefer useKitchenAssetUpdate for new owner-level editors. */
export function useKitchenLogoUpdate() {
  const assets = useKitchenAssetUpdate()
  return {
    pending: assets.pending,
    uploadKitchenLogo: (kitchenId: string, file: File) =>
      assets.uploadKitchenAsset(kitchenId, 'logo', file),
    updateKitchenMediaBackdropColor: assets.updateKitchenBackdrop,
  }
}
