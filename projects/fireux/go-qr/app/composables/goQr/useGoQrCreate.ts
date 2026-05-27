import { useFirestoreApiCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreApiCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'

export type GoQrCreateInput = {
  file: File
  slug: string
  type: 'doc' | 'food-menu'
}

export type GoQrCreateResult = {
  ok: boolean
  slug: string
  path: string
  qr_path: string
}

export const GoQrCreatePlan = defineFireuxCreatePlan({
  intent: 'provision',
  routes: ['server_api', 'storage_upload', 'firestore_set'],
})

export function useGoQrCreate() {
  const { createDocument: createApiDocument } = useFirestoreApiCreate()

  async function createDocument(input: GoQrCreateInput) {
    const formData = new FormData()
    formData.append('file', input.file)
    formData.append('slug', input.slug.trim())
    formData.append('type', input.type)

    return await createApiDocument<GoQrCreateResult, FormData>(
      '/api/docs/create',
      formData
    )
  }

  return {
    createPlan: GoQrCreatePlan,
    createDocument,
  }
}
