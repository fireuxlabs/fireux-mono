// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfile.ts
import { computed, type ComputedRef } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from '../../operations/useFirestoreRead.ts'
import { useProfileDelete } from './useProfileDelete'
import { useProfileEnsure } from './useProfileEnsure'
import { useProfileComputed } from './useProfileComputed'
import { useProfileUpdate } from './useProfileUpdate'

/** Minimal local types (replace with shared models when ready) */
export interface ProfileBase {
  id?: string
  display_name?: string
  avatar?: string
  handle?: string
}
export interface ProfileConfig {
  /** Unique id for this profile type, used by UIs */
  id: string
  /** Firestore collection name for core (and app overlay) */
  collectionName: string
  /** Human label for CTAs */
  profileType: string
  /** Optional CTA message override */
  cta?: string
}

type ProfileUnion<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = (Partial<TCore> & Partial<TApp>) & {
  id: string
  core: TCore | null
  app?: TApp | null
}

/**
 * Unified profile reader (core + optional app overlay).
 * - Returns a flattened computed profile where app fields override core.
 * - Also exposes collection refs: { local (tenant), global (core) }.
 */
export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { isTenant, appId } = useFireUXConfig()

  const uid = computed(() => currentUser.value?.uid ?? null)

  // Core profile doc (always attempt when signed-in)
  const coreRef = computed<DocumentReference<TCore> | null>(() =>
    uid.value
      ? (doc(db, config.collectionName, uid.value) as DocumentReference<TCore>)
      : null
  )
  const { data: coreDoc } = useDocument<TCore>(coreRef)

  // App overlay (only when tenant + appId)
  const appRef = computed<DocumentReference<TApp> | null>(() =>
    uid.value && isTenant && appId
      ? (doc(
          db,
          `apps/${appId}/${config.collectionName}`,
          uid.value
        ) as DocumentReference<TApp>)
      : null
  )
  const { data: appDoc } = useDocument<TApp>(appRef)

  // Flattened profile (app > core)
  const profile: ComputedRef<ProfileUnion<TCore, TApp> | null> = computed(
    () => {
      if (!uid.value) return null
      const core = coreDoc.value ?? null
      const app = isTenant ? appDoc.value ?? null : undefined

      const flattened = {
        id: uid.value,
        core,
        app,
      } as ProfileUnion<TCore, TApp>

      if (core) Object.assign(flattened, core)
      if (app) Object.assign(flattened, app)

      return flattened
    }
  )

  // Collections
  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionLocal =
    isTenant && appId
      ? firestoreFetchCollection<TApp>(`apps/${appId}/${config.collectionName}`)
      : null

  let collectionGlobal = isTenant
    ? null
    : firestoreFetchCollection<TCore>(config.collectionName)

  const fetchGlobal = () => {
    if (!isTenant) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection<TCore>(config.collectionName)
    return collectionGlobal
  }

  return {
    profile,
    collection: {
      local: collectionLocal,
      global: collectionGlobal,
      fetchGlobal,
    },
    ...useProfileComputed(profile, config),
    ...useProfileDelete(profile, config),
    ...useProfileEnsure(profile, config),
    ...useProfileUpdate(config),
  }
}
