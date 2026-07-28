import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
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

export function useKitchenWordmarkUpdate(
  options: UseKitchenWordmarkUpdateOptions = {}
) {
  const collectionPath = computed(() => clean(unref(options.collectionPath)))
  const { selectedId } = useConsoleSelection('kitchen')
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { uploadImage } = useImageStorage()
  const { updateKitchen } = useKitchenUpdate({ collectionPath })
  const pending = ref(false)

  const uploadKitchenWordmark = async (
    kitchenId: string,
    file: File,
    kind: KitchenWordmarkKind
  ) => {
    const id = clean(kitchenId)
    requireWritableData()
    if (!id) throw new Error('No kitchen selected.')
    if (clean(selectedId.value) !== id) {
      throw new Error('Select this Kitchen before uploading its wordmark.')
    }
    if (pending.value) return ''

    pending.value = true
    try {
      const url = await uploadImage(
        `kitchens/${id}/identity/${storageSegment(kind)}/current`,
        file
      )

      requireWritableData()
      if (clean(selectedId.value) !== id) {
        throw new Error('The selected Kitchen changed before the wordmark could be saved.')
      }
      await updateKitchen(id, {
        [identityField(kind)]: url,
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
