import { useFirestoreApiCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreApiCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'

export type GoQrCreateInput = {
  file: File
  slug: string
  type?: 'doc'
}

export type GoQrCreateResult = {
  ok: boolean
  slug: string
  path: string
  qr_path: string
}

export const GoQrCreatePlan = defineFireuxCreatePlan({
  family: 'with_provision',
})

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useGoQrCreate() {
  const { createDocument: createApiDocument } = useFirestoreApiCreate()

  async function createDocument(input: GoQrCreateInput) {
    const formData = new FormData()
    formData.append('file', input.file)
    formData.append('slug', normalizeString(input.slug))
    formData.append('type', input.type || 'doc')

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
