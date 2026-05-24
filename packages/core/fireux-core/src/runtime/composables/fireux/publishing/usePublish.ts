import { useFirestoreUpdate } from '../firestore/operations/useFirestoreUpdate'

type PublishPatch = Record<string, unknown>

export type PublishInput<TPatch extends PublishPatch = PublishPatch> = {
  collectionPath: string
  id: string
  routePath?: string
  patch: TPatch
}

export type PublishResult = {
  id: string
  routePath: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

function cleanRoutePath(value: unknown) {
  const path = clean(value)
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

export function usePublish() {
  const { updateDocument } = useFirestoreUpdate()

  async function publish<TPatch extends PublishPatch>(
    input: PublishInput<TPatch>
  ): Promise<PublishResult> {
    const collectionPath = clean(input.collectionPath)
    const id = clean(input.id)
    const routePath = cleanRoutePath(input.routePath)
    const patch = { ...(input.patch ?? {}) } as TPatch

    if (!collectionPath) throw new Error('Publish collection path is required.')
    if (!id) throw new Error('Publish document id is required.')
    if (!Object.keys(patch).length) throw new Error('Publish patch is required.')

    await updateDocument(collectionPath, id, patch)

    return {
      id,
      routePath,
    }
  }

  return {
    publish,
  }
}
