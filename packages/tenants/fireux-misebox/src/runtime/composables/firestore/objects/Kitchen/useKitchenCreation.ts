import { ref } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/useFirestoreManager.ts'
import type { Kitchen } from '../../../../models/Kitchen.model'

interface KitchenCreatePayload {
  id: string
  name: string
  description?: string
  app_id?: string | null
}

export function useKitchenCreation() {
  const { setDocument } = useFirestoreManager()
  const isCreating = ref(false)
  const error = ref<string | null>(null)

  async function create(payload: KitchenCreatePayload): Promise<Kitchen> {
    const id = payload.id?.trim()
    const name = payload.name?.trim()

    if (!id) {
      throw new Error('Kitchen requires an id that matches the place_id.')
    }
    if (!name) {
      throw new Error('Kitchen name is required.')
    }

    isCreating.value = true
    error.value = null

    const body = {
      name,
      description: payload.description?.trim() || null,
      app_id: payload.app_id ?? null,
    }

    try {
      await setDocument('kitchens', id, body)

      return {
        id,
        name,
        description: body.description ?? undefined,
        app_id: body.app_id,
      }
    } catch (err: any) {
      const message = err?.message ?? 'Failed to create kitchen'
      error.value = message
      throw new Error(message)
    } finally {
      isCreating.value = false
    }
  }

  return {
    create,
    isCreating,
    error,
  }
}
