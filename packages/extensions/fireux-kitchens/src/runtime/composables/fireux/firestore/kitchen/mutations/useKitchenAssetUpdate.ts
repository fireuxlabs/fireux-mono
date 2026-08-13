import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { ref } from 'vue'
import type {
  KitchenMediaBackdropColor,
  KitchenUpdateInput,
} from '../../../../../models/kitchen.model'
import { useKitchenUpdate } from './useKitchenUpdate'

export type KitchenAssetRole = 'image' | 'logo' | 'wordmark'

const clean = (value: unknown) => String(value ?? '').trim()

/** Canonical Kitchen asset writer shared by entity and Console edit doorways. */
export function useKitchenAssetUpdate() {
  const { uploadImage } = useImageStorage()
  const { updateKitchen } = useKitchenUpdate()
  const pending = ref(false)

  async function uploadKitchenAsset(
    kitchenId: string,
    role: KitchenAssetRole,
    file: File
  ) {
    const id = clean(kitchenId)
    if (!id) throw new Error('Kitchen id is required.')
    if (pending.value) return ''

    pending.value = true
    try {
      const url = await uploadImage(`kitchens/${id}/assets/${role}`, file)
      await updateKitchen(id, {
        [`assets.${role}`]: url,
      } as KitchenUpdateInput)
      return url
    } finally {
      pending.value = false
    }
  }

  async function updateKitchenBackdrop(
    kitchenId: string,
    color: KitchenMediaBackdropColor | ''
  ) {
    const id = clean(kitchenId)
    if (!id) throw new Error('Kitchen id is required.')
    await updateKitchen(id, { 'assets.backdrop_color': color })
  }

  return { pending, uploadKitchenAsset, updateKitchenBackdrop }
}
