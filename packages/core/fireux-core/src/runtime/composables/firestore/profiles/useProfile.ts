import { computed, watchEffect } from 'vue'
import { useCurrentUser } from 'vuefire'

import { useFireUXConfig } from '../../FireUXConfig.ts'
import { createOverlayAccessors, mergeOverlayCollection } from '../_shared/overlay.ts'
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

/**
 * Unified profile accessor bridging core and tenant overlays.
 */
export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { isTenant, appId } = useFireUXConfig()

  const uid = computed(() => currentUser.value?.uid ?? null)

  const { current: profile, byId } = createOverlayAccessors<
    TCore,
    TApp,
    ProfileUnion<TCore, TApp>
  >({
    id: uid,
    key: config.collectionName,
    requireCore: true,
  })

  const { profile: profileState } = useProfileState<ProfileUnion<
    TCore,
    TApp
  > | null>(config.id)
  watchEffect(() => {
    profileState.value = profile.value
  })

  const { firestoreFetchCollection } = useFirestoreRead()

  const globalRef = firestoreFetchCollection<TCore>(config.collectionName)
  const localRef =
    isTenant && appId
      ? firestoreFetchCollection<TApp>(
          `apps/${appId}/${config.collectionName}`
        )
      : null

  const collectionValue = computed<ProfileUnion<TCore, TApp>[]>(() =>
    mergeOverlayCollection<TCore, TApp, ProfileUnion<TCore, TApp>>({
      cores: globalRef.value ?? [],
      overlays: localRef?.value ?? [],
      isTenant,
      appId: appId ?? null,
      requireCore: true,
    })
  )

  const collection = Object.assign(collectionValue, {
    local: localRef,
    global: globalRef,
    fetchGlobal: () => globalRef,
  })

  function fetchedProfile(id: string) {
    return { profile: byId(id) }
  }

  return {
    profile,
    fetchedProfile,
    collection,
    ...useProfileComputed(profile, config),
    ...useProfileDelete(profile, config),
    ...useProfileEnsure(profile, config),
  }
}
