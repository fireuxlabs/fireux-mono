import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useImageStorage } from '../firebase/useImageStorage'

type TargetTuple = [string, string]

type ImageSpec<T extends Record<string, unknown>> = {
  source: string
  path: string
  field: keyof T
  store?: 'url' | 'path'
}

type ImageFactory<T extends Record<string, unknown>> = (ctx: {
  id: string
}) => ImageSpec<T>

/** Result shape for ensureDoc */
export type EnsureResult<T> = {
  created: boolean
  id: string
  data: T
}

/** Minimal adapter contract for ensureDoc */
export type EnsureAdapter<T extends Record<string, unknown>> = {
  target: () => Promise<TargetTuple> | TargetTuple
  build: () => Promise<T> | T
  image?: ImageFactory<T>
}

/**
 * Generic ensure helper for Firestore documents.
 * - Returns early if the doc already exists.
 * - Builds the doc via adapter when missing.
 * - Optionally uploads a single image and injects the Storage ref.
 * - Leaves creator metadata and timestamps for the caller to handle.
 */
export async function ensureDoc<T extends Record<string, unknown>>(
  adapter: EnsureAdapter<T>
): Promise<EnsureResult<T>> {
  const db = useFirestore()
  const { uploadImage, getDownloadUrlForPath } = useImageStorage()

  const [collection, id] = await adapter.target()
  const ref = doc(db, collection, id)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return { created: false, id, data: snap.data() as T }
  }

  const docData = { ...(await adapter.build()) } as T

  if (adapter.image) {
    const spec = adapter.image({ id })
    if (!spec?.source || !spec.path || !spec.field) {
      throw new Error('[ensureDoc] invalid image adapter spec')
    }

    const uploadedUrl = await uploadImage(spec.path, spec.source)
    const storeMode = spec.store ?? 'url'

    let storedRef: string
    if (storeMode === 'path') {
      storedRef = spec.path
    } else {
      storedRef =
        uploadedUrl ||
        (await getDownloadUrlForPath(spec.path).catch(() => spec.path))
    }

    const fieldName = spec.field
    ;(docData as Record<string, unknown>)[fieldName as string] = storedRef
  }

  await setDoc(ref, docData)

  return { created: true, id, data: docData }
}
