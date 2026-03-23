import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestore } from '../../../vuefire'

export type ConsoleEntityType = 'kitchen' | 'portfolio' | 'supplier' | 'project'
export type ConsoleCreateMode = 'public' | 'console'

export type ConsoleEnsureResult = {
  id: string
  createdRoot: boolean
  createdOverlay: boolean
}

export type ConsoleRootEnsureResult = {
  id: string
  created: boolean
}

type MaybePromise<T> = T | Promise<T>

type ConsoleEnsureOptions<TOverlay> = {
  type: ConsoleEntityType
  mode?: ConsoleCreateMode
  existingRootId?: string | null
  ensureRoot?: () => MaybePromise<ConsoleRootEnsureResult>
  createOverlay?: (rootId: string) => MaybePromise<TOverlay>
  overlayId?: string | null
}

const consoleCollectionByType: Record<ConsoleEntityType, string> = {
  kitchen: 'kitchens',
  portfolio: 'portfolios',
  supplier: 'suppliers',
  project: 'projects',
}

const normalizeId = (value: unknown) => String(value || '').trim()

export function useConsoleEnsure() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { appId, isTenant } = useFireUXConfig()

  async function ensureConsole<TOverlay>(
    options: ConsoleEnsureOptions<TOverlay>
  ): Promise<ConsoleEnsureResult> {
    const mode = options.mode ?? 'console'
    const collectionName = consoleCollectionByType[options.type]

    let id = ''
    let createdRoot = false
    let createdOverlay = false

    const existingRootId = normalizeId(options.existingRootId)

    if (existingRootId) {
      const rootRef = doc(db, collectionName, existingRootId)
      const rootSnap = await getDoc(rootRef)

      if (!rootSnap.exists()) {
        throw new Error(
          `[console:${options.type}] Root record "${existingRootId}" does not exist`
        )
      }

      id = existingRootId
    } else {
      if (!options.ensureRoot) {
        throw new Error(
          `[console:${options.type}] ensureRoot is required when no existing root id is provided`
        )
      }

      const rootResult = await options.ensureRoot()
      id = normalizeId(rootResult?.id)
      createdRoot = Boolean(rootResult?.created)

      if (!id) {
        throw new Error(
          `[console:${options.type}] ensureRoot must return a valid root id`
        )
      }
    }

    if (mode === 'public') {
      return {
        id,
        createdRoot,
        createdOverlay: false,
      }
    }

    if (!isTenant || !appId) {
      return {
        id,
        createdRoot,
        createdOverlay: false,
      }
    }

    if (!options.createOverlay) {
      throw new Error(
        `[console:${options.type}] createOverlay is required in console mode`
      )
    }

    const resolvedOverlayId = normalizeId(options.overlayId) || id
    const overlayRef = doc(db, 'apps', appId, collectionName, resolvedOverlayId)
    const overlaySnap = await getDoc(overlayRef)

    if (!overlaySnap.exists()) {
      const overlayPayload = await options.createOverlay(id)
      await setDocument<TOverlay>(
        `apps/${appId}/${collectionName}`,
        resolvedOverlayId,
        overlayPayload,
        {
          app: true,
          creator: true,
        }
      )
      createdOverlay = true
    }

    return {
      id,
      createdRoot,
      createdOverlay,
    }
  }

  return { ensureConsole }
}
