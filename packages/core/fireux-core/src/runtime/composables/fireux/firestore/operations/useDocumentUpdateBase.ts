import { useFirestoreUpdate } from './useFirestoreUpdate'
import { useFirestoreUtils } from '../utils/useFirestoreUtils'

type DocumentUpdateBaseOptions = {
  /** Use optional App-scoped collection path resolution. */
  resolvePath?: boolean
  /** When resolvePath is true, treat the collection as app-scoped. */
  appScoped?: boolean
  /** Label used in error messages. */
  label?: string
}

export function useDocumentUpdateBase<T extends Record<string, any>>(
  collectionName: string,
  options: DocumentUpdateBaseOptions = {}
) {
  const { updateDocument } = useFirestoreUpdate()
  const resolvePath = options.resolvePath ?? false
  const appScoped = options.appScoped ?? true

  const collectionPath = resolvePath
    ? useFirestoreUtils().getCollectionPath(collectionName, appScoped)
    : collectionName

  const normalizeId = (value?: string | null) => String(value ?? '').trim()

  const requireId = (value?: string | null) => {
    const id = normalizeId(value)
    if (!id) {
      throw new Error(
        `[useDocumentUpdateBase] ${options.label ?? collectionName} id is required`
      )
    }
    return id
  }

  const pruneUndefined = (payload: Partial<T>) => {
    const entries = Object.entries(payload).filter(
      ([, value]) => value !== undefined
    )
    return Object.fromEntries(entries) as Partial<T>
  }

  const cleanString = (value: unknown) =>
    typeof value === 'string' ? value.trim() : ''

  const toStringArray = (value: string | string[]) =>
    Array.from(
      new Set(
        (Array.isArray(value) ? value : (value ?? '').split(','))
          .map((item) => String(item ?? '').trim())
          .filter(Boolean)
      )
    )

  const updateById = async (
    id: string,
    patch: Partial<T>,
    options: { prune?: boolean } = {}
  ) => {
    const docId = requireId(id)
    const next = options.prune ? pruneUndefined(patch) : patch
    await updateDocument<T>(collectionPath, docId, next)
  }

  return {
    collectionPath,
    normalizeId,
    requireId,
    pruneUndefined,
    cleanString,
    toStringArray,
    updateById,
  }
}
