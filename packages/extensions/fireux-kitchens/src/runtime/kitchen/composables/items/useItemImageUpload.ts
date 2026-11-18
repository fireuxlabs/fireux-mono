import { refreshNuxtData } from 'nuxt/app'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { ref, type WatchSource } from 'vue'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { useItemEditorScope } from './useItemEditorScope'

type ItemImageUploadResponse = {
  ok: true
  dish_id: string
  image: string
  object_path: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useItemImageUpload(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth()
  const pending = ref(false)
  const captureScope = useItemEditorScope(ownerSources, () => {
    pending.value = false
  })

  async function uploadItemImage(input: {
    dishId: string
    kitchenId: string
    file: File
  }) {
    const dishId = text(input.dishId)
    const kitchenId = text(input.kitchenId)
    const file = input.file
    const user = currentUser.value
    const isCurrent = captureScope()

    if (!kitchenId) throw new Error('Kitchen id is required.')
    if (!isFirestoreDocumentId(dishId)) throw new Error('Item id is required.')
    if (!(file instanceof File)) throw new Error('Item image is required.')
    if (pending.value) throw new Error('A Item image is already uploading.')

    if (!user) throw new Error('Sign in before uploading a Item image.')
    const assertScope = () => {
      if (!isCurrent() || currentUser.value?.uid !== user.uid)
        throw new Error(
          'The account or Kitchen changed before the Item image upload completed.'
        )
    }
    assertScope()
    pending.value = true
    try {
      const token = await user.getIdToken()
      assertScope()
      if (!token) throw new Error('Sign in before uploading a Item image.')
      const form = new FormData()
      form.set('file', file, file.name || 'dish-image')
      const result = await $fetch<ItemImageUploadResponse>(
        `/api/workspace/kitchen/dishes/${encodeURIComponent(dishId)}/image`,
        {
          onResponse: async ({ options, response }) => {
            if (
              response.ok &&
              !['GET', 'HEAD'].includes(
                String(options.method || 'GET').toUpperCase()
              )
            )
              await refreshNuxtData()
          },
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          query: { kitchenId },
          body: form,
        }
      )
      if (
        result?.ok !== true ||
        result.dish_id !== dishId ||
        typeof result.image !== 'string' ||
        !result.image.trim() ||
        typeof result.object_path !== 'string' ||
        !result.object_path.trim()
      )
        throw new Error('Item image response did not identify the saved image.')
      return result
    } finally {
      if (isCurrent()) pending.value = false
    }
  }

  return {
    pending,
    uploadItemImage,
  }
}
