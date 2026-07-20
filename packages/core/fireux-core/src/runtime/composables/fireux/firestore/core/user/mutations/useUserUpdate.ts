// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: keep private client updates within account preferences.
import { readRuntimeIdentityFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { UserPrivateUpdateInput } from '../../../../../../models/core/user.model'
import {
  UserPrivateStorage,
  UserStorage,
} from '../../../../../../models/core/user.model'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import type { UserRefs } from '../fetch/useUserFetch'
import { useCoreUserUpdate } from '../utils/update/useCoreUserUpdate'
import { useAppUserUpdate } from '../utils/update/useAppUserUpdate'
import { useFireUXConfig } from '../../../../app/FireUXConfig'

const loggedInitKeys = new Set<string>()

export function useUserUpdate(user: UserRefs, sourceLabel = 'unspecified') {
  const core = useCoreUserUpdate(user)
  const app = useAppUserUpdate(user)
  const identityUpdate = useFirestoreUpdate({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const cfg = useFireUXConfig()

  const update = async (
    data: UserPrivateUpdateInput,
    options: { private: true }
  ) => {
    if (options.private !== true) {
      throw new Error('[useUserUpdate] Private updates require { private: true }.')
    }

    const uid = user.coreUser?.value?.id ?? user.user?.value?.id
    if (!uid) throw new Error('[useUserUpdate] Missing user id')
    if (!user.privateUser?.value) {
      throw new Error('Private account record is not available for this user.')
    }

    const keys = Object.keys(data)
    if (keys.some((key) => key !== 'preferences')) {
      throw new Error(
        '[useUserUpdate] Email, terms, and account stamps are server-owned.'
      )
    }

    await identityUpdate.updateDocument(
      `${UserStorage.rootCollection}/${uid}/${UserPrivateStorage.collection}`,
      UserPrivateStorage.document,
      data
    )
  }

  // Canon: both docs use the SAME uid as their document id
  const coreUid = user.coreUser?.value?.id ?? user.user?.value?.id ?? null

  // NOTE: appUser.id is ALSO uid (NOT appId)
  const appUserUid = user.appUser?.value?.id ?? null

  const activeAppId = cfg.appId || cfg.globalAppId

  if (cfg.devMode) {
    if (coreUid && appUserUid && coreUid !== appUserUid) {
      throw new Error(
        `[useUserUpdate] core uid (${coreUid}) != appUser uid (${appUserUid}); source=${sourceLabel}`
      )
    }
  }

  // During initial boot it is normal for user/app context to be unavailable.
  // Only log once when fully initialized, and only in dev.
  if (cfg.devMode && coreUid && activeAppId) {
    const key = `${sourceLabel}:${coreUid}:${activeAppId}`
    if (!loggedInitKeys.has(key)) {
      loggedInitKeys.add(key)
      console.info('[useUserUpdate] initialized', {
        uid: coreUid,
        appId: activeAppId,
        source: sourceLabel,
      })
    }
  }

  return {
    core,
    app,
    update,
  }
}
