import { useRoute } from '#imports'
import { computed } from 'vue'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useUserRead } from '../useUserRead'
import { useUserBootstrap } from '../identity/useUserBootstrap'
import { useUserAccount } from './useUserAccount'
import { provisionSignedInUserAccount } from './provision-user-account'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/user-account-provisioning'
import { isUserIdentityComplete } from '../../utils/normalize-user'
import type { ReadOutcome } from '../../../utils/read-outcome'
import type { UserAccount } from '../../models/user-account.model'
import type { User } from '../../models/user.model'

/** Setup is derived from current records, never stored as an onboarding flag. */
function resolveUserSetup(input: {
  authResolved: boolean
  signedIn: boolean
  identity: ReadOutcome
  identityData: User | null | undefined
  account: ReadOutcome
  accountData: UserAccount | null
}) {
  const reads = [input.identity, input.account]
  const failed = input.signedIn && reads.includes('error')
  const pending =
    !input.authResolved ||
    (input.signedIn &&
      !failed &&
      reads.some((outcome) => outcome === 'idle' || outcome === 'pending'))
  const settled = input.authResolved && input.signedIn && !pending && !failed
  const requiresConsent =
    settled &&
    (input.account !== 'ready' ||
      input.accountData?.terms?.version !== FIREUX_ACCOUNT_TERMS_VERSION ||
      input.accountData?.terms?.accepted_at == null)
  const requiresIdentity =
    settled &&
    (input.identity !== 'ready' || !isUserIdentityComplete(input.identityData))
  return {
    pending,
    failed,
    requiresConsent,
    needsSetup: requiresConsent || requiresIdentity,
  }
}

/** Own setup reads and explicit completion for the current page and account. */
export function useUserSetup() {
  const auth = useAuth()
  const config = useFireUXConfig()
  const route = useRoute()
  const uid = computed(() =>
    auth.hasAuthState.value && auth.isAuthenticated.value ? auth.uid.value : ''
  )
  const identity = useUserRead(uid)
  const account = useUserAccount()
  const status = computed(() =>
    resolveUserSetup({
      authResolved: auth.hasAuthState.value,
      signedIn: auth.isAuthenticated.value,
      identity: identity.outcome.value,
      identityData: identity.user.value,
      account: account.outcome.value,
      accountData: account.account.value,
    })
  )
  const error = computed(() => {
    if (!auth.hasAuthState.value || !auth.isAuthenticated.value) return null
    return (
      identity.error.value ||
      account.error.value ||
      (status.value.failed
        ? new Error('Your account could not be loaded. Please try again.')
        : null)
    )
  })
  const bootstrap = import.meta.client
    ? useUserBootstrap(auth.currentUser)
    : null
  const captureSetup = useCommandScope([
    () => auth.currentUser.value?.uid,
    () => config.appId,
    () => route.fullPath,
  ])
  let flight: { isCurrent: () => boolean; result: Promise<boolean> } | undefined
  let completed: (() => boolean) | undefined

  async function complete(termsVersion?: string) {
    if (status.value.pending || status.value.failed) return false
    if (!auth.isAuthenticated.value) return false
    if (!status.value.needsSetup || completed?.()) return true
    if (
      status.value.requiresConsent &&
      termsVersion !== FIREUX_ACCOUNT_TERMS_VERSION
    ) {
      throw new Error(
        'Accept the Terms of Service and acknowledge the Privacy Policy to continue.'
      )
    }
    const actor = auth.currentUser.value
    if (!bootstrap || !actor || actor.isAnonymous || !auth.isReady.value)
      return false
    if (flight?.isCurrent()) return flight.result

    const isCurrent = captureSetup()
    const provision = async () => {
      try {
        await provisionSignedInUserAccount(actor, termsVersion)
        if (!isCurrent()) return false
        await bootstrap.bootstrapUser(actor, isCurrent)
        if (!isCurrent()) return false
        completed = isCurrent
        return true
      } catch (error) {
        if (isCurrent()) throw error
        return false
      }
    }
    const result = provision()
    flight = { isCurrent, result }
    try {
      return await result
    } finally {
      if (flight?.result === result) flight = undefined
    }
  }
  return { status, error, complete }
}
