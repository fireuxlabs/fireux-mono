// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: normalize app-private profile ids.
// Concurrent edit — 2026-07-20 16:20 CEST — Console Spine pass: expose App membership read state to console targeting.
// Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: fail closed when hydrating canonical User avatars.
// Concurrent edit — 2026-07-20 23:21 CEST — Active User Outcome fix: preserve canonical User read outcomes.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: normalize optional stored biography into the shared User runtime.
// Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: expose independent App-membership and private-account outcomes.
import type { Ref } from 'vue'
import { computed, isRef } from 'vue'
import type { User } from '../../../../../../models/core/user.model'
import {
  type UserAccount,
  UserAccountModel,
} from '../../../../../../models/operations/user-account.model'
import { resolveUserAvatarSource } from '../../../../../../utils/user-avatar'
import type { CurrentAppMembershipDto } from '../../../../../../server/utils/public-projection/public-dto.types'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useCurrentAppContext } from '../../../../app/useCurrentAppContext'
import { usePublicUserIdentity } from '../../../../public/user/usePublicUserIdentity'
import { useCurrentUserAccount } from '../../../../user/useCurrentUserAccount'

export type UserFetchOutcome =
  | 'idle'
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

function normalizeCoreUser(raw: User, fallbackId: string): User {
  const anyRaw = raw as any
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    display_name: (raw as any).display_name ?? raw.id ?? fallbackId,
    bio:
      typeof anyRaw.bio === 'string' && anyRaw.bio.trim().length <= 280
        ? anyRaw.bio.trim()
        : '',
    avatar: resolveUserAvatarSource((raw as any).avatar),
    handle: (raw as any).handle ?? '',
  }
}

function normalizeUserAccount(
  raw: UserAccount,
  fallbackId: string
): UserAccount {
  const preferences =
    raw.preferences && typeof raw.preferences === 'object'
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
      language:
        typeof preferences.language === 'string' && preferences.language.trim()
          ? preferences.language
          : UserAccountModel.preferences.language,
      theme,
      email_security_alerts:
        typeof preferences.email_security_alerts === 'boolean'
          ? preferences.email_security_alerts
          : UserAccountModel.preferences.email_security_alerts,
      share_usage_analytics:
        typeof preferences.share_usage_analytics === 'boolean'
          ? preferences.share_usage_analytics
          : UserAccountModel.preferences.share_usage_analytics,
    },
    terms: raw.terms ?? UserAccountModel.terms,
  }
}

/**
 * Arbitrary User reads are public-only. The optional App scope resolves only
 * the signed-in user's bounded membership projection.
 */
export function useUserFetch(
  id: string | null | undefined | Ref<string | null | undefined>,
  options: { app?: boolean; private?: boolean } = {}
) {
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))
  const includeApp = options.app === true
  const includePrivate = options.private === true

  // Auth-bound user docs are not reliably available during SSR.
  // Avoid VueFire SSR warnings by only binding Firestore sources on the client.
  if (import.meta.server) {
    const coreUser = computed<User | null | undefined>(() => null)
    const appUser = computed<CurrentAppMembershipDto | null | undefined>(
      () => null
    )
    const privateUser = computed<UserAccount | null | undefined>(() => null)
    const user = computed<User | null>(() => null)
    const pending = computed(() => false)
    const coreError = computed<unknown>(() => null)
    const coreOutcome = computed<UserFetchOutcome>(() => 'idle')
    const appPending = computed(() => false)
    const appError = computed<unknown>(() => null)
    const appOutcome = computed<UserFetchOutcome>(() => 'idle')
    const privatePending = computed(() => false)
    const privateError = computed<unknown>(() => null)
    const privateOutcome = computed<UserFetchOutcome>(() => 'idle')
    return {
      user,
      coreUser,
      appUser,
      privateUser,
      pending,
      coreError,
      coreOutcome,
      appPending,
      appError,
      appOutcome,
      privatePending,
      privateError,
      privateOutcome,
    }
  }

  const privateScopeRequested = computed(() =>
    Boolean(uid.value && includePrivate)
  )

  // Canonical User identity is public data, but active-user surfaces should
  // consume the same bounded server projection as every other User surface.
  // This avoids coupling dashboard/header availability to raw client Rules.
  const coreState = usePublicUserIdentity(uid)
  const privateState = includePrivate ? useCurrentUserAccount() : null
  const coreUserRef = coreState.user
  const corePending = coreState.pending
  const coreError = coreState.error
  const privateUserRef = computed(() => privateState?.account.value ?? null)
  const privatePending = computed(() =>
    privateScopeRequested.value ? Boolean(privateState?.pending.value) : false
  )
  const privateError = computed<unknown>(() =>
    privateScopeRequested.value ? privateState?.error.value ?? null : null
  )
  const appContext = includeApp ? useCurrentAppContext() : null
  const appScopeRequested = computed(() =>
    Boolean(includeApp && uid.value && appId)
  )
  const appIdentityError = computed<Error | null>(() => {
    if (
      !appScopeRequested.value ||
      !appContext ||
      appContext.pending.value
    ) {
      return null
    }

    return uid.value === appContext.uid.value
      ? null
      : new Error(
          '[useUserFetch] App membership is only available for the signed-in user.'
        )
  })
  const appPending = computed(() =>
    appScopeRequested.value && appContext
      ? Boolean(appContext.pending.value)
      : false
  )
  const appError = computed<unknown>(() => {
    if (!appScopeRequested.value || !appContext) return null
    return appIdentityError.value || appContext.error.value || null
  })
  const coreUser = computed<User | null | undefined>(() => {
    if (corePending.value) return undefined
    if (coreError.value) return undefined

    const raw = coreUserRef.value
    if (!raw) return null

    const fallbackId = uid.value ?? ''
    return normalizeCoreUser(raw as User, fallbackId)
  })

  const appUser = computed<CurrentAppMembershipDto | null | undefined>(() => {
    if (!appScopeRequested.value) return null
    if (appPending.value) return undefined
    if (appError.value) return undefined
    return appContext?.membership.value ?? null
  })

  const privateUser = computed<UserAccount | null | undefined>(() => {
    if (!privateScopeRequested.value) return null
    if (privatePending.value) return undefined
    const raw = privateUserRef.value
    if (!raw) return null
    return normalizeUserAccount(raw as UserAccount, uid.value ?? '')
  })

  const coreOutcome = computed<UserFetchOutcome>(() => {
    if (!uid.value) return 'idle'
    if (corePending.value) return 'pending'
    if (coreError.value) return 'error'
    return coreUser.value ? 'ready' : 'missing'
  })

  const appOutcome = computed<UserFetchOutcome>(() => {
    if (!includeApp || !uid.value || !appId) return 'idle'
    if (appPending.value) return 'pending'
    if (appError.value) return 'error'
    return appUser.value ? 'ready' : 'missing'
  })

  const privateOutcome = computed<UserFetchOutcome>(() => {
    if (!privateScopeRequested.value) return 'idle'
    if (privatePending.value) return 'pending'
    if (privateError.value) return 'error'
    return privateUser.value ? 'ready' : 'missing'
  })

  const user = computed<User | null>(() => coreUser.value ?? null)

  const pending = computed(
    () => Boolean(corePending.value) || Boolean(appPending?.value)
  )

  return {
    user,
    coreUser,
    appUser,
    privateUser,
    pending,
    coreError,
    coreOutcome,
    appPending,
    appError,
    appOutcome,
    privatePending,
    privateError,
    privateOutcome,
  }
}

export type UserRefs = ReturnType<typeof useUserFetch>
