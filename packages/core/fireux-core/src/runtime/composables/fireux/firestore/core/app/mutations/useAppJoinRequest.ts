import { arrayUnion } from 'firebase/firestore'
import { computed } from 'vue'
import { AppStorage, type App } from '../../../../../../models/core/app.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useAuth } from '../../../../firebase/useAuth'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useApp } from '../useApp'
import { useUser } from '../../user/useUser'

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
  const { app, pending: appPending } = useApp()
  const { appUser, pending: userPending } = useUser()
  const { updateDocument } = useFirestoreUpdate()

  const userId = computed(() => text(uid.value))
  const joinRequests = computed(() =>
    Array.isArray(app.value?.join_requests)
      ? app.value.join_requests.map((id: unknown) => text(id)).filter(Boolean)
      : []
  )
  const isAppMember = computed(() => Boolean(appUser.value))
  const pending = computed(() => Boolean(appPending.value || userPending.value))
  const hasPendingRequest = computed(() =>
    Boolean(userId.value && joinRequests.value.includes(userId.value))
  )
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

    await updateDocument<App>(AppStorage.collection, id, {
      join_requests: arrayUnion(requesterId) as unknown as App['join_requests'],
    })
  }

  return {
    app,
    pending,
    userId,
    isAuthenticated,
    isAppMember,
    hasPendingRequest,
    canRequest,
    requestJoinApp,
  }
}
