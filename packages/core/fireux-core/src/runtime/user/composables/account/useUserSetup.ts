import { useRoute } from '#imports'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useUserSession } from '../session/useUserSession'
import { useUserBootstrap } from '../identity/useUserBootstrap'
import { useUserAccount } from './useUserAccount'
import {
  createUserSetupCoordinator,
  type UserSetupState,
} from './user-setup-coordinator'
import { resolveUserSetup } from '../../utils/user-setup'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/user-account-provisioning'

/** Own setup reads and explicit completion for the current page and account. */
export function useUserSetup() {
  const auth = useAuth()
  const config = useFireUXConfig()
  const route = useRoute()
  const session = useUserSession()
  const account = useUserAccount()
  const status = computed(() =>
    resolveUserSetup({
      authResolved: auth.hasAuthState.value,
      signedIn: auth.isAuthenticated.value,
      identity: session.userOutcome.value,
      identityData: session.user.value,
      account: account.outcome.value,
      membership: session.appUserOutcome.value,
      accountData: account.account.value,
    })
  )
  const error = computed(() => {
    if (!auth.hasAuthState.value || !auth.isAuthenticated.value) return null
    return (
      session.userError.value ||
      account.error.value ||
      session.appUserError.value ||
      (status.value.failed
        ? new Error('Your account could not be loaded. Please try again.')
        : null)
    )
  })
  const state = ref<UserSetupState>({
    uid: null,
    status: 'idle',
    generation: 0,
  })
  const lastError = ref<unknown>(null)
  const coordinator = createUserSetupCoordinator({
    currentUser: auth.currentUser,
    isReady: auth.isReady,
    state,
    lastError,
    userCreate: import.meta.client ? useUserBootstrap(auth.currentUser) : null,
  })
  watch(
    [
      () => auth.currentUser.value?.uid,
      () => config.appId,
      () => route.fullPath,
    ],
    () => coordinator.reset(),
    { flush: 'sync' }
  )
  onScopeDispose(() => coordinator.reset())

  async function complete(termsVersion?: string) {
    if (status.value.pending || status.value.failed) return false
    if (!auth.isAuthenticated.value) return false
    if (!status.value.needsSetup) return true
    if (
      status.value.requiresConsent &&
      termsVersion !== FIREUX_ACCOUNT_TERMS_VERSION
    ) {
      throw new Error(
        'Accept the Terms of Service and acknowledge the Privacy Policy to continue.'
      )
    }
    return coordinator.retry(termsVersion)
  }
  return { status, error, complete }
}
