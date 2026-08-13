import { useKitchenAssetUpdate } from './useKitchenAssetUpdate'

/** @deprecated Prefer useKitchenAssetUpdate for new owner-level editors. */
export function useKitchenWordmarkUpdate() {
  const assets = useKitchenAssetUpdate()
  return {
    pending: assets.pending,
    uploadKitchenWordmark: (kitchenId: string, file: File) =>
      assets.uploadKitchenAsset(kitchenId, 'wordmark', file),
  }
}
