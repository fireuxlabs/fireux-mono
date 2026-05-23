import { useFirestoreApiCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreApiCreate'

export type QrdocCreateInput = {
  file: File
  slug: string
  type: 'doc' | 'food-menu'
}

export type QrdocCreateResult = {
  ok: boolean
  slug: string
  path: string
  qr_path: string
}

export function useQrdocCreate() {
  const { createDocument: createApiDocument } = useFirestoreApiCreate()

  async function createDocument(input: QrdocCreateInput) {
    const formData = new FormData()
    formData.append('file', input.file)
    formData.append('slug', input.slug.trim())
    formData.append('type', input.type)

    return await createApiDocument<QrdocCreateResult, FormData>(
      '/api/docs/create',
      formData
    )
  }

  return {
    createDocument,
  }
}
