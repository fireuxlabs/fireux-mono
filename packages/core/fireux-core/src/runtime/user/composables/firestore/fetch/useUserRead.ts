import { computed, isRef, type Ref } from 'vue'
import type { User } from '../../../models/user.model.ts'
import { type UserAccount, UserAccountModel } from '../../../models/user-account.model.ts'
import { normalizeUser } from '../../../utils/normalize-user'
import { useUserIdentitySummary } from '../../useUserIdentitySummary'
import { useCurrentUserAccount } from '../../useCurrentUserAccount'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'

export type UserSessionReadOutcome = 'idle' | 'pending' | 'ready' | 'missing' | 'error'

function normalizeCoreUser(raw: User, fallbackId: string): User {
  return normalizeUser(raw.id || fallbackId, raw) ?? {
    id: fallbackId,
    display_name: '',
    bio: '',
    avatar: '',
    handle: '',
  }
}

function normalizeAccount(raw: UserAccount, fallbackId: string): UserAccount {
  const preferences = raw.preferences && typeof raw.preferences === 'object'
    ? raw.preferences
    : UserAccountModel.preferences
  const theme = ['system', 'light', 'dark'].includes(String(preferences.theme))
    ? preferences.theme
    : UserAccountModel.preferences.theme

  return {
    ...raw,
    id: raw.id ?? fallbackId,
    email: typeof raw.email === 'string' ? raw.email : '',
    preferences: {
      language: typeof preferences.language === 'string' && preferences.language.trim()
        ? preferences.language
        : UserAccountModel.preferences.language,
      theme,
      email_security_alerts: typeof preferences.email_security_alerts === 'boolean'
        ? preferences.email_security_alerts
        : UserAccountModel.preferences.email_security_alerts,
      share_usage_analytics: typeof preferences.share_usage_analytics === 'boolean'
        ? preferences.share_usage_analytics
        : UserAccountModel.preferences.share_usage_analytics,
    },
    terms: raw.terms ?? UserAccountModel.terms,
  }
}

/** Read Core User identity and, for the signed-in User, its private account. */
export function useUserSessionRead(
  id: string | null | undefined | Ref<string | null | undefined>,
  options: { account?: boolean } = {}
) {
  const uid = computed(() => (isRef(id) ? id.value : id))

  if (import.meta.server) {
    return {
      user: computed<User | null>(() => null),
      coreUser: computed<User | null | undefined>(() => null),
      pending: computed(() => false),
      error: computed<unknown>(() => null),
      outcome: computed<UserSessionReadOutcome>(() => 'idle'),
      account: computed<UserAccount | null | undefined>(() => null),
      accountPending: computed(() => false),
      accountError: computed<unknown>(() => null),
      accountOutcome: computed<UserSessionReadOutcome>(() => 'idle'),
    }
  }

  const { currentUser: authUser } = useAuth()
  const identityUid = computed(() =>
    authUser.value?.isAnonymous && authUser.value.uid === uid.value ? null : uid.value
  )
  const identity = useUserIdentitySummary(identityUid)
  const accountRequested = computed(() =>
    options.account === true &&
    Boolean(uid.value) &&
    authUser.value?.uid === uid.value &&
    !authUser.value?.isAnonymous
  )
  const accountState = options.account ? useCurrentUserAccount() : null

  const coreUser = computed<User | null | undefined>(() => {
    if (identity.pending.value || identity.error.value) return undefined
    if (!identity.user.value) return null
    return normalizeCoreUser(identity.user.value as User, uid.value ?? '')
  })
  const user = computed<User | null>(() => coreUser.value ?? null)
  const outcome = computed<UserSessionReadOutcome>(() => {
    if (!uid.value) return 'idle'
    if (identity.pending.value) return 'pending'
    if (identity.error.value) return 'error'
    return coreUser.value ? 'ready' : 'missing'
  })

  const accountPending = computed(() =>
    accountRequested.value ? Boolean(accountState?.pending.value) : false
  )
  const accountError = computed<unknown>(() =>
    accountRequested.value ? accountState?.error.value ?? null : null
  )
  const account = computed<UserAccount | null | undefined>(() => {
    if (!accountRequested.value) return null
    if (accountPending.value || accountError.value) return undefined
    const raw = accountState?.account.value
    return raw ? normalizeAccount(raw, uid.value ?? '') : null
  })
  const accountOutcome = computed<UserSessionReadOutcome>(() => {
    if (!accountRequested.value) return 'idle'
    if (accountPending.value) return 'pending'
    if (accountError.value) return 'error'
    return account.value ? 'ready' : 'missing'
  })

  return {
    user,
    coreUser,
    pending: identity.pending,
    error: identity.error,
    outcome,
    account,
    accountPending,
    accountError,
    accountOutcome,
  }
}

export type UserSessionRead = ReturnType<typeof useUserSessionRead>
