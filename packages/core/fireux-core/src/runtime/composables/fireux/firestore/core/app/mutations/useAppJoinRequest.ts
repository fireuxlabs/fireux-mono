// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: submit App join requests through the authenticated server boundary.
// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: remove the unused raw App subscription.

import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { AppStorage } from '../../../../../../models/core/app.model'
import { AppJoinRequestStorage } from '../../../../../../models/core/supporting/app-membership'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useAuth } from '../../../../firebase/useAuth'
import { useDocument, useFirestore } from '../../../vuefire'
import { useUser } from '../../user/useUser'
import { mutateAppMembership } from '../../user/utils/appMembershipMutation'

const text = (value: unknown) => String(value ?? '').trim()

/**
 * Public app join-request seam.
 *
 * This requests app membership by adding the signed-in user to
 * `apps/{appId}.join_requests`. App Admin approves or removes the request.
 */
export function useAppJoinRequest() {
  const { appId } = useFireUXConfig()
  const { uid, isAuthenticated } = useAuth()
  const { appUser, pending: userPending } = useUser()
  const db = useFirestore()

  const userId = computed(() => text(uid.value))
  const requestRef = computed(() =>
    appId && userId.value
      ? doc(
          db,
          AppStorage.collection,
          appId,
          AppJoinRequestStorage.collection,
          userId.value
        )
      : null
  )
  const requestState = useDocument(requestRef as any)
  const isAppMember = computed(() => Boolean(appUser.value))
  const pending = computed(() =>
    Boolean(userPending.value || requestState.pending.value)
  )
  const hasPendingRequest = computed(() => Boolean(requestState.data.value))
  const canRequest = computed(
    () =>
      Boolean(isAuthenticated.value && userId.value) &&
      !isAppMember.value &&
      !hasPendingRequest.value
  )

  async function requestJoinApp() {
    const id = text(appId)
    const requesterId = userId.value

    if (!id) throw new Error('App id is required')
    if (!requesterId) throw new Error('Sign in to request app access')
    if (isAppMember.value || hasPendingRequest.value) return

    await mutateAppMembership({ action: 'request-join' })
  }

  return {
    pending,
    userId,
    isAuthenticated,
    isAppMember,
    hasPendingRequest,
    canRequest,
    requestJoinApp,
  }
}
