import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestore } from '../../../vuefire'
import { useAuth } from '../../../../firebase/useAuth'

export type ConsoleEntityType = 'kitchen' | 'portfolio' | 'supplier' | 'project'
export type ConsoleCreateMode = 'public' | 'console'

export type ConsoleCreateResult = {
  id: string
  createdRoot: boolean
  createdOverlay: boolean
}

export type ConsoleRootCreateResult = {
  id: string
  created: boolean
}

type MaybePromise<T> = T | Promise<T>

type ConsoleCreateOptions<TOverlay> = {
  type: ConsoleEntityType
  mode?: ConsoleCreateMode
  existingRootId?: string | null
  createRoot?: () => MaybePromise<ConsoleRootCreateResult>
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

function resolveAppScopeState(rootData: Record<string, unknown>, rootId: string, appId: string) {
  const runtimeAppId = normalizeId(rootData.app_id)
  if (runtimeAppId === appId || appId === `${rootId}-app`) {
    return 'dedicated_app'
  }

  return 'parent_app'
}

export function useConsoleCreate() {
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
      where('operator_ids', 'array-contains', currentUid)
    )
    const overlaysSnap = await getDocs(overlaysQuery)

    const accessibleOverlayIds = overlaysSnap.docs
      .map((snap) => normalizeId(snap.id))
      .filter(Boolean)

    if (!accessibleOverlayIds.length) return
    if (accessibleOverlayIds.includes(overlayId)) return

    throw new Error(
      `Standard users can only be on one live ${type} team per app. Premium unlocks multiple.`
    )
  }

  async function createConsole<TOverlay>(
    options: ConsoleCreateOptions<TOverlay>
  ): Promise<ConsoleCreateResult> {
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
      if (!options.createRoot) {
        throw new Error(
          `[console:${options.type}] createRoot is required when no existing root id is provided`
        )
      }

      const rootResult = await options.createRoot()
      id = normalizeId(rootResult?.id)
      createdRoot = Boolean(rootResult?.created)

      if (!id) {
        throw new Error(
          `[console:${options.type}] createRoot must return a valid root id`
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

    const rootRef = doc(db, collectionName, id)
    const rootSnap = await getDoc(rootRef)
    if (rootSnap.exists()) {
      const rootData = rootSnap.data() ?? {}
      const appScopeState = resolveAppScopeState(rootData, id, currentAppId)
      const appScopeAppId = currentAppId

      if (
        rootData.app_scope_state !== appScopeState ||
        rootData.app_scope_app_id !== appScopeAppId
      ) {
        const currentUid = normalizeId(uid.value)
        await setDoc(
          rootRef,
          {
            app_scope_state: appScopeState,
            app_scope_app_id: appScopeAppId,
            updated: {
              at: serverTimestamp(),
              ...(currentUid ? { by: currentUid } : {}),
            },
          },
          { merge: true }
        )
      }
    }

    return {
      id,
      createdRoot,
      createdOverlay,
    }
  }

  return { createConsole }
}
