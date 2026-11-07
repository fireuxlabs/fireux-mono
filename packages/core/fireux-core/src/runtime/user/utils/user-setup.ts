import type { UserAccount } from '../models/user-account.model'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../models/user-account-provisioning.ts'

type ReadOutcome = 'idle' | 'pending' | 'error' | 'empty' | 'ready'

/** Setup is derived from current records, never stored as an onboarding flag. */
export function resolveUserSetup(input: {
  authResolved: boolean
  signedIn: boolean
  identity: ReadOutcome
  account: ReadOutcome
  membership: ReadOutcome
  accountData: UserAccount | null
}) {
  const reads = [input.identity, input.account, input.membership]
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
  const requiresIdentity = settled && input.identity === 'empty'
  const requiresMembership = settled && input.membership === 'empty'
  return {
    pending,
    failed,
    requiresConsent,
    requiresIdentity,
    requiresMembership,
    needsSetup: requiresConsent || requiresIdentity || requiresMembership,
  }
}
