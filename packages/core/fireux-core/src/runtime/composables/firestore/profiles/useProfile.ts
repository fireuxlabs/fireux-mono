import { computed, watchEffect, type ComputedRef, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig.ts'
import { useFirestoreRead } from '../operations/useFirestoreRead.ts'
import { useProfileDelete } from './useProfileDelete.ts'
import { useProfileEnsure } from './useProfileEnsure.ts'
import { useProfileComputed } from './useProfileComputed.ts'
import { useProfileState } from '../../state/useProfileState.ts'
import type {
  ProfileConfig,
  ProfileBase,
} from '../../../models/profiles/profile.model.ts'

type ProfileUnion<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = (Partial<TCore> & Partial<TApp>) & {
  id: string
  core: TCore | null
  app?: TApp | null
}

type ProfileCollectionRef<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = Ref<ProfileUnion<TCore, TApp>[] | undefined>

/**
 * Unified profile accessor bridging core and tenant overlays.
 */
export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const uid = computed(() => currentUser.value?.uid ?? null)

  const coreRef = computed<DocumentReference<TCore> | null | undefined>(() =>
    uid.value
      ? (doc(db, config.collectionName, uid.value) as DocumentReference<TCore>)
      : null
  )
  const { data: coreDoc } = useDocument<TCore>(coreRef)

  const appRef = computed<DocumentReference<TApp> | null | undefined>(() =>
    uid.value && isTenant
      ? (doc(
          db,
          `apps/${appId}/${config.collectionName}`,
          uid.value
        ) as DocumentReference<TApp>)
      : null
  )
  const { data: appDoc } = useDocument<TApp>(appRef)

  const profile: ComputedRef<ProfileUnion<TCore, TApp> | null> = computed(
    () => {
      if (!uid.value) return null

      const base = { id: uid.value }
      const core = coreDoc.value ?? null
      const app = isTenant ? appDoc.value ?? null : undefined

      const merged = {
        ...base,
        core,
        app,
      } as ProfileUnion<TCore, TApp>

      if (core) Object.assign(merged, core)
      if (app) Object.assign(merged, app)

      return merged
    }
  )

  const { profile: profileState } = useProfileState<ProfileUnion<
    TCore,
    TApp
  > | null>(config.id)
  watchEffect(() => {
    profileState.value = profile.value
  })

  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionLocal: ProfileCollectionRef<TCore, TApp> | null = isTenant
    ? firestoreFetchCollection<ProfileUnion<TCore, TApp>>(
        `apps/${appId}/${config.collectionName}`
      )
    : null

  let collectionGlobal: ProfileCollectionRef<TCore, TApp> | null = isTenant
    ? null
    : firestoreFetchCollection<ProfileUnion<TCore, TApp>>(config.collectionName)

  const fetchGlobal = (): ProfileCollectionRef<TCore, TApp> | null => {
    if (!isTenant) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection<ProfileUnion<TCore, TApp>>(
      config.collectionName
    )
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
