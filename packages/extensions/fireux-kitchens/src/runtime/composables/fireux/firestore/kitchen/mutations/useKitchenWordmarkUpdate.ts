import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref, unref, type Ref } from 'vue'
import { useKitchenUpdate } from './useKitchenUpdate'

type MaybeRef<T> = T | Ref<T>
export type KitchenWordmarkKind = 'no-logo' | 'standard'
type UseKitchenWordmarkUpdateOptions = {
  collectionPath?: MaybeRef<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const storageSegment = (kind: KitchenWordmarkKind) =>
  kind === 'no-logo' ? 'wordmark-no-logo' : 'wordmark'
const identityField = (kind: KitchenWordmarkKind) =>
  kind === 'no-logo'
    ? 'identity.wordmark_no_logo_image_url'
    : 'identity.wordmark_image_url'
const flatField = (kind: KitchenWordmarkKind) =>
  kind === 'no-logo'
    ? 'wordmark_no_logo_image_url'
    : 'wordmark_image_url'

export function useKitchenWordmarkUpdate(
  options: UseKitchenWordmarkUpdateOptions = {}
) {
  const collectionPath = computed(() => clean(unref(options.collectionPath)))
  const { uploadImage } = useImageStorage()
  const { updateKitchen } = useKitchenUpdate({ collectionPath })
  const pending = ref(false)

  const uploadKitchenWordmark = async (
    kitchenId: string,
    file: File,
    kind: KitchenWordmarkKind
  ) => {
    const id = clean(kitchenId)
    if (!id) throw new Error('No kitchen selected.')
    if (pending.value) return ''

    pending.value = true
    try {
      const url = await uploadImage(
        `kitchens/${id}/identity/${storageSegment(kind)}/current`,
        file
      )

      await updateKitchen(id, {
        [identityField(kind)]: url,
        [flatField(kind)]: url,
      })

      return url
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    uploadKitchenWordmark,
  }
}
