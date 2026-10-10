import { computed } from 'vue'
import {
  AppJoinRequestStorage,
  type AppJoinRequest,
} from '../../models/app-membership'
import { useFireUXConfig } from '../config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useUserSession } from '../../../user/composables/session/useUserSession'
import { runAppUserCommand } from '../../utils/runAppUserCommand'

/** Read the current account's request; the trusted command owns App membership. */
export function useAppJoinRequest() {
  const { appId } = useFireUXConfig()
  const { uid, isAuthenticated, hasAuthState } = useAuth()
  const { appUser, pending: userPending, error: userError } = useUserSession()
  const userId = computed(() => String(uid.value || '').trim())
  const active = computed(() =>
    Boolean(
      hasAuthState.value && isAuthenticated.value && appId && userId.value
    )
  )
  const collectionPath = computed(() =>
    active.value ? `apps/${appId}/${AppJoinRequestStorage.collection}` : ''
  )
  const { firestoreFetchDoc } = useFirestoreRead()
  const request = firestoreFetchDoc<AppJoinRequest>(
    collectionPath,
    computed(() => (active.value ? userId.value : ''))
  )
  const isAppMember = computed(() => Boolean(appUser.value))
  const pending = computed(
    () => !hasAuthState.value || userPending.value || request.pending.value
  )
  const error = computed(() => userError.value || request.error.value)
  const hasPendingRequest = computed(() => request.outcome.value === 'ready')
  const canRequest = computed(
    () =>
      active.value &&
      !pending.value &&
      !error.value &&
      !isAppMember.value &&
      !hasPendingRequest.value
  )
  const captureIntent = useCommandScope([uid, () => appId])

  async function requestJoinApp() {
    if (!appId) throw new Error('App id is required')
    if (!userId.value) throw new Error('Sign in to request app access')
    if (isAppMember.value || hasPendingRequest.value) return
    if (!canRequest.value)
      throw new Error('Wait until your App access has loaded.')
    await runAppUserCommand({ action: 'request-join' })
  }

  return {
    pending,
    error,
    userId,
    isAuthenticated,
    isAppMember,
    hasPendingRequest,
    canRequest,
    captureIntent,
    requestJoinApp,
  }
}
