import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref, unref, type Ref } from 'vue'
import type { KitchenImageShade } from '../../../../../models/kitchen.model'
import { useKitchenUpdate } from './useKitchenUpdate'

type MaybeRef<T> = T | Ref<T>
type UseKitchenLogoUpdateOptions = {
  collectionPath?: MaybeRef<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useKitchenLogoUpdate(
  options: UseKitchenLogoUpdateOptions = {}
) {
  const collectionPath = computed(() => clean(unref(options.collectionPath)))
  const { selectedId } = useConsoleSelection('kitchen')
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { uploadImage } = useImageStorage()
  const { updateKitchen } = useKitchenUpdate({ collectionPath })
  const pending = ref(false)

  const requireSelectedKitchen = (kitchenId: string) => {
    const id = clean(kitchenId)
    requireWritableData()
    if (!id) throw new Error('No Kitchen selected.')
    if (clean(selectedId.value) !== id) {
      throw new Error('Select this Kitchen before changing its logo.')
    }
    return id
  }

  const uploadKitchenLogo = async (kitchenId: string, file: File) => {
    const id = requireSelectedKitchen(kitchenId)
    if (pending.value) return ''

    pending.value = true
    try {
      const url = await uploadImage(
        `kitchens/${id}/identity/logo/current`,
        file
      )
      requireSelectedKitchen(id)
      await updateKitchen(id, {
        'identity.logo_image_url': url,
      })
      return url
    } finally {
      pending.value = false
    }
  }

  const updateKitchenLogoShade = async (
    kitchenId: string,
    imageShade: KitchenImageShade
  ) => {
    const id = requireSelectedKitchen(kitchenId)
    await updateKitchen(id, {
      'identity.image_shade': imageShade,
    })
  }

  return {
    pending,
    uploadKitchenLogo,
    updateKitchenLogoShade,
  }
}
