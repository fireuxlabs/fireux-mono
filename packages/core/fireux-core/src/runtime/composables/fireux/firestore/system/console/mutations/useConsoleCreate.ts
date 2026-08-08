// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: attach console targets through the server-owned AppUser capability transaction.
// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority: re-read created roots before app-support ownership checks.
// Concurrent edit — 2026-07-20 22:40 CEST — Supplier/Portfolio Authority Hardening: bind App support ids to validated canonical roots.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name console App support creation explicitly.
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { AppStorage } from '../../../../../../models/core/app.model'
import {
  normalizeFireuxAppScopeState,
  resolveFireuxAppScopeStateForRole,
} from '../../../../../../utils/app-scope-state'
import { AppUserStorage } from '../../../../../../models/core/user.model'
import { hasAppUserPremiumAccess } from '../../../../../../utils/app-user-access'
import { useFirestoreClientCreate } from '../../../mutations/useFirestoreClientCreate'
import { useFirestore } from '../../../vuefire'
import { useAuth } from '../../../../firebase/useAuth'
import { defineRuntimeClientCreateTarget } from '../../../../../../utils/firestore-mutations/targets'
import { useFirestoreClientUpdate } from '../../../operations/useFirestoreClientUpdate'
import { defineFirestoreMutationTarget } from '../../../../../../utils/firestore-mutations/targets'

export type ConsoleEntityType =
  | 'kitchen'
  | 'portfolio'
  | 'property'
  | 'supplier'
export type ConsoleCreateMode = 'public' | 'console'

export type ConsoleCreateResult = {
  id: string
  createdRoot: boolean
  createdAppSupport: boolean
}

export type ConsoleRootCreateResult = {
  id: string
  created: boolean
}

type MaybePromise<T> = T | Promise<T>

type ConsoleCreateOptions<TAppSupport> = {
  type: ConsoleEntityType
  mode?: ConsoleCreateMode
  existingRootId?: string | null
  createRoot?: () => MaybePromise<ConsoleRootCreateResult>
  validateRoot?: (
    rootId: string,
    rootData: Record<string, unknown>
  ) => MaybePromise<void>
  createAppSupport?: (rootId: string) => MaybePromise<TAppSupport>
}

const consoleCollectionByType: Record<ConsoleEntityType, string> = {
  kitchen: 'kitchens',
  portfolio: 'portfolios',
  property: 'properties',
  supplier: 'suppliers',
}

const normalizeId = (value: unknown) => String(value || '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

function readAppScope(rootData: Record<string, unknown>) {
  const appScope = record(rootData.app_scope)

  return {
    state: normalizeFireuxAppScopeState(
      appScope.state || rootData.app_scope_state
    ),
    appId: normalizeId(appScope.app_id || rootData.app_scope_app_id),
  }
}

export function useConsoleCreate() {
  const db = useFirestore()
  const create = useFirestoreClientCreate()
  const { appId, developerId, role } = useFireUXConfig()
  const { uid } = useAuth()
  const { updateDocument } = useFirestoreClientUpdate()

  const appSupportTarget = (appId: string, collectionName: string) =>
    defineFirestoreMutationTarget({
      key: 'project.app-support',
      lane: 'client',
      verbs: ['update'],
      database: { kind: 'runtime' },
      collectionPath: `${AppStorage.collection}/${appId}/${collectionName}`,
    })

  const appTarget = (collectionName: string) =>
    defineFirestoreMutationTarget({
      key: `project.${collectionName}`,
      lane: 'client',
      verbs: ['update'],
      database: { kind: 'runtime' },
      collectionPath: collectionName,
    })

  async function assertCanCreateAdditionalConsole(
    type: ConsoleEntityType,
    rootId: string
  ) {
    if (type === 'kitchen') return

    const currentUid = normalizeId(uid.value)
    const currentAppId = normalizeId(appId)
    if (!currentUid || !currentAppId) return

    const appUserRef = doc(
      db,
      AppStorage.collection,
      currentAppId,
      AppUserStorage.collection,
      currentUid
    )
    const appUserSnap = await getDoc(appUserRef)
    if (
      appUserSnap.exists() &&
      hasAppUserPremiumAccess(appUserSnap.data(), {
        isConfiguredDeveloper:
          Boolean(developerId) && currentUid === developerId,
      })
    ) {
      return
    }

    const collectionName = consoleCollectionByType[type]
    const appSupportQuery = query(
      collection(db, AppStorage.collection, currentAppId, collectionName),
      where('operator_ids', 'array-contains', currentUid)
    )
    const appSupportSnap = await getDocs(appSupportQuery)

    const accessibleAppSupportIds = appSupportSnap.docs
      .map((snap) => normalizeId(snap.id))
      .filter(Boolean)

    if (!accessibleAppSupportIds.length) return
    if (accessibleAppSupportIds.includes(rootId)) return

    throw new Error(
      `Standard users can only be on one live ${type} team per app. Premium unlocks multiple.`
    )
  }

  async function createConsole<TAppSupport>(
    options: ConsoleCreateOptions<TAppSupport>
  ): Promise<ConsoleCreateResult> {
    const collectionName = consoleCollectionByType[options.type]

    let id = ''
    let createdRoot = false
    let createdAppSupport = false
    let existingRootData: Record<string, unknown> | null = null

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
      existingRootData = rootSnap.data() ?? {}
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

      const rootRef = doc(db, collectionName, id)
      const rootSnap = await getDoc(rootRef)

      if (!rootSnap.exists()) {
        throw new Error(
          `[console:${options.type}] createRoot returned "${id}", but that root record does not exist`
        )
      }

      existingRootData = rootSnap.data() ?? {}
    }

    if (options.validateRoot) {
      if (!existingRootData) {
        throw new Error(
          `[console:${options.type}] Root record "${id}" could not be validated`
        )
      }

      await options.validateRoot(id, existingRootData)
    }

    // App-hosted support records are canonical for app access/operations in any
    // app context, including global apps. Root identity remains canonical above.
    // "Public" versus "console" affects the route flow, not whether the app-scoped
    // App support record should exist.
    const currentAppId = normalizeId(appId)
    if (!currentAppId) {
      return {
        id,
        createdRoot,
        createdAppSupport: false,
      }
    }

    const appScopeState = resolveFireuxAppScopeStateForRole(role)
    if (!appScopeState) {
      throw new Error(
        `[console:${options.type}] App role "${normalizeId(role)}" cannot own an app-scoped console target`
      )
    }

    if (existingRootData) {
      const existingScope = readAppScope(existingRootData)
      const belongsToAnotherApp =
        (existingScope.state === 'parent_app' ||
          existingScope.state === 'tenant_app') &&
        Boolean(existingScope.appId) &&
        existingScope.appId !== currentAppId

      if (belongsToAnotherApp) {
        throw new Error(
          `[console:${options.type}] Root record "${id}" belongs to app "${existingScope.appId}". Transfer its app-scoped records before assigning it to app "${currentAppId}".`
        )
      }
    }

    if (!options.createAppSupport) {
      throw new Error(
        `[console:${options.type}] createAppSupport is required in console mode`
      )
    }

    const appSupportRef = doc(
      db,
      AppStorage.collection,
      currentAppId,
      collectionName,
      id
    )
    const appSupportSnap = await getDoc(appSupportRef)

    if (!appSupportSnap.exists()) {
      await assertCanCreateAdditionalConsole(options.type, id)
      const appSupportPayload = await options.createAppSupport(id)
      const appSupportCollection =
        `${AppStorage.collection}/${currentAppId}/${collectionName}`
      await create(
        defineRuntimeClientCreateTarget(
          `project.app-support.${options.type}`,
          appSupportCollection
        ),
        appSupportPayload,
        {
          id,
          app: true,
          creator: true,
        }
      )
      createdAppSupport = true
    }

    const currentUid = normalizeId(uid.value)
    if (currentUid) {
      await updateDocument(
        appSupportTarget(currentAppId, collectionName),
        id,
        {
          operator_ids: arrayUnion(currentUid),
          team_ids: arrayUnion(currentUid),
          'updated.at': serverTimestamp(),
          ...(currentUid ? { 'updated.by': currentUid } : {}),
        }
      )
    }

    const rootRef = doc(db, collectionName, id)
    const rootSnap = await getDoc(rootRef)
    if (rootSnap.exists()) {
      const rootData = rootSnap.data() ?? {}
      const currentScope = readAppScope(rootData)
      const appScopeAppId = currentAppId

      if (
        currentScope.state !== appScopeState ||
        currentScope.appId !== appScopeAppId
      ) {
        const currentUid = normalizeId(uid.value)
        const usesNestedAppScope = Boolean(
          rootData.app_scope &&
          typeof rootData.app_scope === 'object' &&
          !Array.isArray(rootData.app_scope)
        )
        const scopePatch: Record<string, unknown> = {}

        if (usesNestedAppScope) {
          scopePatch['app_scope.state'] = appScopeState
          scopePatch['app_scope.app_id'] = appScopeAppId
        } else {
          scopePatch['app_scope_state'] = appScopeState
          scopePatch['app_scope_app_id'] = appScopeAppId
        }

        scopePatch['updated.at'] = serverTimestamp()
        if (currentUid) {
          scopePatch['updated.by'] = currentUid
        }

        await updateDocument(
          appTarget(collectionName),
          id,
          scopePatch
        )
      }
    }

    return {
      id,
      createdRoot,
      createdAppSupport,
    }
  }

  return { createConsole }
}
