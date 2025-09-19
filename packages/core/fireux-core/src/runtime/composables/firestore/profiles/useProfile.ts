import { computed, watchEffect } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type {
  ProfileConfig,
  ProfileBase,
} from '../../../models/profiles/profile.model'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileDelete } from './useProfileDelete'
import { useProfileEnsure } from './useProfileEnsure'
import { useProfileState } from '../../state/useProfileState'

export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore,
>(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const isGlobal = role === 'global'

  const uid = computed(() => currentUser.value?.uid || null)

  const coreRef = computed<DocumentReference<TCore> | null>(() =>
    uid.value
      ? (doc(db, config.collectionName, uid.value) as DocumentReference<TCore>)
      : null
  )
  const { data: coreDoc } = useDocument<TCore>(coreRef)

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

  const profile = computed(() => {
    if (!uid.value) return null
    return {
      id: uid.value,
      core: coreDoc.value ?? null,
      app: isTenant ? (appDoc.value ?? null) : undefined,
    }
  })

  const { profile: profileState } = useProfileState(config.id)
  watchEffect(() => {
    profileState.value = profile.value
  })

  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()
  type ColRef = ReturnType<typeof firestoreFetchCollection>

  const collectionLocal: ColRef | null =
    isTenant && appId
      ? firestoreFetchCollection(`apps/${appId}/${config.collectionName}`)
      : null

  let collectionGlobal: ColRef | null = isGlobal
    ? firestoreFetchCollection(config.collectionName)
    : null

  function fetchGlobal(): ColRef | null {
    if (isGlobal) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection(config.collectionName)
    return collectionGlobal
  }

  const { ensure } = useProfileEnsure(config)
  const remove = useProfileDelete(config)

  return {
    profile,
    collection: {
      local: collectionLocal,
      global: collectionGlobal,
      fetchGlobal,
    },
    fetchById: (id: string) => firestoreFetchDoc(config.collectionName, id),
    ensure,
    ...remove,
  }
}
