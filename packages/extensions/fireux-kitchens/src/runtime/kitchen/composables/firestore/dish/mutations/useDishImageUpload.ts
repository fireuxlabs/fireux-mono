// Concurrent edit — 2026-07-22 00:37 CEST — Dish media ownership: upload Dish images through the Kitchen-owned server boundary.
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { ref } from 'vue'

type DishImageUploadResponse = {
  ok: true
  dish_id: string
  image: string
  object_path: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useDishImageUpload() {
  const { currentUser } = useAuth()
  const { selectedId } = useWorkspace('kitchen')
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const pending = ref(false)

  async function uploadDishImage(input: {
    dishId: string
    kitchenId: string
    file: File
  }) {
    const dishId = text(input.dishId)
    const kitchenId = text(input.kitchenId)

    requireWritableData()
    if (!kitchenId) throw new Error('Kitchen id is required.')
    if (text(selectedId.value) !== kitchenId) {
      throw new Error('Select this Kitchen before uploading its Dish image.')
    }
    if (!dishId) throw new Error('Dish id is required.')
    if (!(input.file instanceof File))
      throw new Error('Dish image is required.')
    if (pending.value) throw new Error('A Dish image is already uploading.')

    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before uploading a Dish image.')
    requireWritableData()
    if (text(selectedId.value) !== kitchenId) {
      throw new Error(
        'The selected Kitchen changed before the Dish image upload.'
      )
    }

    const form = new FormData()
    form.set('file', input.file, input.file.name || 'dish-image')

    pending.value = true
    try {
      return await $fetch<DishImageUploadResponse>(
        `/api/workspace/kitchen/dishes/${encodeURIComponent(dishId)}/image`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          query: {
            kitchenId,
          },
          body: form,
        }
      )
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    uploadDishImage,
  }
}
