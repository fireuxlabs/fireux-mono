import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'

import { createOverlayAccessors } from '../../_shared/overlay.ts'

import type {
  ProfileBase,
  ProfileConfig,
} from '../../../../models/profiles/profile.model.ts'

export type {
  ProfileBase,
  ProfileConfig,
} from '../../../../models/profiles/profile.model.ts'

export type ProfileRecord<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = TCore & {
  appProfile: TApp | null
}

/**
 * Minimal overlay-aware profile reader.
 * Returns the current profile plus a by-id accessor without collection wiring.
 */
export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const currentUser = useCurrentUser()
  const uid = computed(() => currentUser.value?.uid ?? null)

  const { current, byId } = createOverlayAccessors<
    TCore,
    TApp,
    ProfileRecord<TCore, TApp>
  >({
    id: uid,
    key: config.collectionName,
    requireCore: true,
    map: ({ core, app, isTenant }) => {
      if (!core) return null
      return {
        ...core,
        appProfile: isTenant ? app ?? null : null,
      }
    },
  })

  function fetchedProfile(id: string) {
    return { profile: byId(id) }
  }

  return {
    profile: current,
    fetchedProfile,
  }
}
