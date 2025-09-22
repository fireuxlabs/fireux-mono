import { computed, watchEffect } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileDelete } from './useProfileDelete'
import { useProfileEnsure } from './useProfileEnsure'
import { useProfileComputed } from './useProfileComputed'
import { useProfileState } from '../../state/useProfileState'
import type {
  ProfileConfig,
  ProfileBase,
} from '../../../models/profiles/profile.model'

export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore,
>(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const uid = computed(() => currentUser.value?.uid || null)

  // Core profile doc (always attempt when signed-in)
  const coreRef = computed<DocumentReference<TCore> | null>(() =>
    uid.value
      ? (doc(db, config.collectionName, uid.value) as DocumentReference<TCore>)
      : null
  )
  const { data: coreDoc } = useDocument<TCore>(coreRef)

  // App profile doc (only when tenant + appId)
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

  // Unified profile object (flattened with precedence: app > core > base)
  const profile = computed(() => {
    if (!uid.value) return null

    const base = { id: uid.value }
    const core = coreDoc.value ?? null
    const app = isTenant ? (appDoc.value ?? null) : undefined

    const flat = {
      ...base,
      ...(core ?? {}),
      ...(app ?? {}),
    }

    return {
      ...flat,
      core,
      app,
    }
  })

  // Mirror into Nuxt state (per-profile-type)
  const { profile: profileState } = useProfileState<typeof profile.value>(
    config.id
  )
  watchEffect(() => {
    profileState.value = profile.value
  })

  // Collections
  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionLocal =
    isTenant && appId
      ? firestoreFetchCollection(`apps/${appId}/${config.collectionName}`)
      : null

  let collectionGlobal = !isTenant
    ? firestoreFetchCollection(config.collectionName)
    : null

  function fetchGlobal() {
    if (!isTenant) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection(config.collectionName)
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
  }
}
