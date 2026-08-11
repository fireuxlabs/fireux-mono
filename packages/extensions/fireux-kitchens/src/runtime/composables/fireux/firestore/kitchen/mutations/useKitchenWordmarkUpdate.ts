import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { ref } from 'vue'
import { useKitchenUpdate } from './useKitchenUpdate'

const clean = (value: unknown) => String(value ?? '').trim()

export function useKitchenWordmarkUpdate() {
  const { selectedId } = useConsoleSelection('kitchen')
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { uploadImage } = useImageStorage()
  const { updateKitchen } = useKitchenUpdate()
  const pending = ref(false)

  const uploadKitchenWordmark = async (
    kitchenId: string,
    file: File
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
        `kitchens/${id}/wordmark`,
        file
      )

      requireWritableData()
      if (clean(selectedId.value) !== id) {
        throw new Error('The selected Kitchen changed before the wordmark could be saved.')
      }
      await updateKitchen(id, {
        'assets.wordmark': url,
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
