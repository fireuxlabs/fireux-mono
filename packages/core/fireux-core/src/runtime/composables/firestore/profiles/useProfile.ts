// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfile.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileCreate } from './useProfileCreate'
import { useProfileDelete } from './useProfileDelete'
import { useApp } from '../../app/useApp'

/**
 * Unified entry-point for profiles.
 *
 * Exposes:
 * - current.global       → ALWAYS the ecosystem doc
 * - current.appMirror    → app doc iff role === 'tenant', else null
 * - collection.local     → app list iff role === 'tenant', else null
 * - collection.global    → ecosystem list iff role === 'global'; in tenant null until fetchGlobal()
 * - collection.fetchGlobal() → lazy loader for collection.global (tenant only; no-op in global)
 * - fetchById(id)        → get a single GLOBAL doc (simple version)
 * - ...create, ...remove, ...update → CRUD spreads
 */
export function useProfile(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()

  // Tenancy from useApp()
  const { role, appId } = useApp()
  const isGlobal = computed(() => role === 'global')

  // Firestore helpers
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()
  type ColRef = ReturnType<typeof firestoreFetchCollection> // Ref<any[] | undefined>

  const uid = computed(() => currentUser.value?.uid || null)

  // ---------- CURRENT ----------
  const currentGlobalRef = computed(() =>
    uid.value ? doc(db, config.collectionName, uid.value) : null
  )
  const { data: currentGlobal } = useDocument(currentGlobalRef)

  const currentAppRef = computed(() =>
    uid.value && role === 'tenant' && appId
      ? doc(db, 'apps', appId, config.collectionName, uid.value)
      : null
  )
  const { data: currentAppMirror } = useDocument(currentAppRef)

  // ---------- COLLECTION ----------
  const GLOBAL_PATH = config.collectionName

  // Local: auto in tenant, else null
  const collectionLocal: ColRef | null =
    role === 'tenant' && appId
      ? firestoreFetchCollection(`apps/${appId}/${config.collectionName}`)
      : null

  // Global: auto in global app; tenant starts null (lazy)
  let collectionGlobal: ColRef | null = isGlobal.value
    ? firestoreFetchCollection(GLOBAL_PATH)
    : null

  function fetchGlobal(): ColRef | null {
    if (isGlobal.value) return collectionGlobal
    // Tenant: lazy-load once (nullish coalescing assignment for clarity)
    collectionGlobal ??= firestoreFetchCollection(GLOBAL_PATH)
    return collectionGlobal
  }

  // ---------- Helpers ----------
  const fetchById = (id: string) => firestoreFetchDoc(config.collectionName, id)

  // ---------- CRUD ----------
  const create = useProfileCreate(config) as any
  const remove = useProfileDelete(config) as any
  const update = config.updateComposable ? config.updateComposable() : {}

  return {
    current: {
      global: currentGlobal,
      appMirror: currentAppMirror ?? null,
    },
    collection: {
      local: collectionLocal, // Ref<any[] | undefined> | null
      global: collectionGlobal, // Ref<any[] | undefined> | null
      fetchGlobal, // () => Ref<any[] | undefined> | null
    },
    fetchById,
    ...create,
    ...remove,
    ...update,
  }
}
