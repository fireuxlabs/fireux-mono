import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestore } from '../../../vuefire'
import { useAuth } from '../../../../firebase/useAuth'

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
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()

  async function assertCanCreateAdditionalConsole(
    type: ConsoleEntityType,
    overlayId: string
  ) {
    if (type === 'kitchen') return

    const currentUid = normalizeId(uid.value)
    const currentAppId = normalizeId(appId)
    if (!currentUid || !currentAppId) return

    const appUserRef = doc(db, 'apps', currentAppId, 'users', currentUid)
    const appUserSnap = await getDoc(appUserRef)
    const isPremium = appUserSnap.exists() && appUserSnap.get('is_premium') === true
    if (isPremium) return

    const collectionName = consoleCollectionByType[type]
    const overlaysQuery = query(
      collection(db, 'apps', currentAppId, collectionName),
      where('admin_ids', 'array-contains', currentUid)
    )
    const overlaysSnap = await getDocs(overlaysQuery)

    const accessibleOverlayIds = overlaysSnap.docs
      .filter((snap) => snap.get('console_enabled') !== false)
      .map((snap) => normalizeId(snap.id))
      .filter(Boolean)

    if (!accessibleOverlayIds.length) return
    if (accessibleOverlayIds.includes(overlayId)) return

    throw new Error(
      `Standard users can only own one live ${type} console per app. Premium unlocks multiple.`
    )
  }

  async function ensureConsole<TOverlay>(
    options: ConsoleEnsureOptions<TOverlay>
  ): Promise<ConsoleEnsureResult> {
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

    // App-hosted overlays are canonical for any app context, including global apps.
    // "Public" versus "console" affects the route flow, not whether the app-scoped
    // overlay should exist.
    const currentAppId = normalizeId(appId)
    if (!currentAppId) {
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
    const overlayRef = doc(db, 'apps', currentAppId, collectionName, resolvedOverlayId)
    const overlaySnap = await getDoc(overlayRef)

    if (!overlaySnap.exists()) {
      await assertCanCreateAdditionalConsole(options.type, resolvedOverlayId)
      const overlayPayload = await options.createOverlay(id)
      await setDocument<TOverlay>(
        `apps/${currentAppId}/${collectionName}`,
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
