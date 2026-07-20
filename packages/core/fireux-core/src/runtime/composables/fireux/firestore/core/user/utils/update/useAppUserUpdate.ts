// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: remove browser-owned App role, premium, and membership mirror writes.

import { addDoc, collection } from 'firebase/firestore'
import {
    readRuntimeIdentityFirestoreDatabaseId,
    useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { UserNotification } from '../../../../../../../models/core/supporting/user'
import {
    UserNotificationStorage,
    UserStorage,
} from '../../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import type { UserRefs } from '../../fetch/useUserFetch'
import { mutateAppMembership } from '../appMembershipMutation'
import { createUserNotification } from '../createHelpers'

type AppMembershipActions = {
  /** Single, canonical role toggle (admin <-> user). */
  setAdmin: (makeAdmin: boolean) => Promise<void>

  /** App-scoped premium entitlement. */
  setPremium: (isPremium: boolean) => Promise<void>

  /** Leaves the current app (removes membership overlay + mirrors). */
  leave: () => Promise<void>
}

type AppNotificationActions = {
  /** Writes non-membership notifications. */
  push: (message: string) => Promise<UserNotification>
}

export function useAppUserUpdate(user: UserRefs) {
  const cfg = useFireUXConfig()
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const identityDb = useFirestore(identityDatabaseId)

  const requireContext = () => {
    const uid = user.coreUser?.value?.id ?? user.user?.value?.id
    if (!uid) throw new Error('[useAppUserUpdate] Missing core user uid')

    const appId = cfg.appId
    if (!appId) throw new Error('[useAppUserUpdate] Missing appId')

    return { uid, appId }
  }

  const membership: AppMembershipActions = {
    setAdmin: async (makeAdmin) => {
      const { uid } = requireContext()
      const role = makeAdmin ? 'admin' : 'user'
      await mutateAppMembership({
        action: 'set-role',
        userId: uid,
        role,
      })
    },
    setPremium: async (isPremium) => {
      const { uid } = requireContext()
      await mutateAppMembership({
        action: 'set-premium',
        userId: uid,
        isPremium: Boolean(isPremium),
      })
    },
    leave: async () => {
      const { uid } = requireContext()
      await mutateAppMembership({
        action: 'remove-member',
        userId: uid,
      })
    },
  }

  const notifications: AppNotificationActions = {
    push: async (message) => {
      const { uid, appId } = requireContext()

      const notification: UserNotification = createUserNotification({
        message,
        scope: 'app',
        appId,
      })

      await addDoc(
        collection(identityDb, UserStorage.rootCollection, uid, UserNotificationStorage.collection),
        notification
      )

      return notification
    },
  }

  return {
    membership,
    notifications,
  }
}
