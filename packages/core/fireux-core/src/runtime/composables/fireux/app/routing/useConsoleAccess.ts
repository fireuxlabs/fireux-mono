import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../firebase/useAuth'
import { useUser } from '../../firestore/core/user/useUser'
import {
  CONSOLE_ROOT,
  type ConsoleChildRoute,
  discoverConsoleChildren,
  getConsoleScopeFromPath,
  isConsoleRoutePath,
} from './consoleRoutes'

type UseConsoleAccessOptions = {
  targetPath?: MaybeRefOrGetter<string | null | undefined>
}

export type ConsoleAccessStatus =
  | 'unauthenticated'
  | 'disabled'
  | 'forbidden'
  | 'granted'

function asScopeList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => String(entry || '').trim().toLowerCase())
    .filter(Boolean)
}

function normalizeScope(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function resolveConsoleEnabled(
  isAuthenticated: boolean,
  appUser: { console_enabled?: unknown } | null | undefined,
  isAdmin: boolean
) {
  if (!isAuthenticated) return false
  if (typeof appUser?.console_enabled === 'boolean') {
    return appUser.console_enabled
  }
  return isAdmin
}

export function resolveAllowedConsoleScopes(
  appUser: { console_scopes?: unknown } | null | undefined,
  isAdmin: boolean,
  discoveredScopes: string[]
) {
  const explicitScopes = asScopeList(appUser?.console_scopes)
  if (explicitScopes.length) return explicitScopes
  if (isAdmin) return discoveredScopes
  return []
}

type ResolveConsoleAccessDecisionParams = {
  isAuthenticated: boolean
  appUser: { console_enabled?: unknown; console_scopes?: unknown } | null | undefined
  isAdmin: boolean
  discoveredChildren: ConsoleChildRoute[]
  requestedScope?: string | null | undefined
}

export function resolveConsoleAccessDecision(
  params: ResolveConsoleAccessDecisionParams
) {
  const requestedScope = normalizeScope(params.requestedScope)
  const discoveredScopes = params.discoveredChildren.map((entry) => entry.key)
  const consoleEnabled = resolveConsoleEnabled(
    params.isAuthenticated,
    params.appUser,
    params.isAdmin
  )
  const allowedScopes = consoleEnabled
    ? resolveAllowedConsoleScopes(params.appUser, params.isAdmin, discoveredScopes)
    : []
  const hasScopeAccess = requestedScope
    ? allowedScopes.includes(requestedScope)
    : consoleEnabled

  const status: ConsoleAccessStatus = !params.isAuthenticated
    ? 'unauthenticated'
    : !consoleEnabled
      ? 'disabled'
      : requestedScope && !hasScopeAccess
        ? 'forbidden'
        : 'granted'

  const firstAllowedChild =
    params.discoveredChildren.find((entry) => allowedScopes.includes(entry.key)) || null

  return {
    status,
    requestedScope,
    consoleEnabled,
    allowedScopes,
    hasScopeAccess,
    firstAllowedChild,
  }
}

export function useConsoleAccess(options: UseConsoleAccessOptions = {}) {
  const router = useRouter()
  const auth = useAuth()
  const { appUser, isAdmin } = useUser()

  const discoveredChildren = computed(() =>
    discoverConsoleChildren(router.getRoutes())
  )

  const discoveredScopes = computed(() =>
    discoveredChildren.value.map((entry) => entry.key)
  )

  const requestedPath = computed(() => String(toValue(options.targetPath) || '').trim())
  const isConsoleRoute = computed(() =>
    isConsoleRoutePath(requestedPath.value)
  )
  const requestedScope = computed(() =>
    getConsoleScopeFromPath(requestedPath.value)
  )

  const explicitConsoleEnabled = computed(() =>
    typeof appUser.value?.console_enabled === 'boolean'
      ? appUser.value.console_enabled
      : null
  )

  const explicitScopes = computed(() => asScopeList(appUser.value?.console_scopes))
  const decision = computed(() =>
    resolveConsoleAccessDecision({
      isAuthenticated: auth.isAuthenticated.value,
      appUser: {
        console_enabled: explicitConsoleEnabled.value ?? appUser.value?.console_enabled,
        console_scopes: explicitScopes.value,
      },
      isAdmin: isAdmin.value,
      discoveredChildren: discoveredChildren.value,
      requestedScope: requestedScope.value,
    })
  )

  const consoleEnabled = computed(() => decision.value.consoleEnabled)
  const allowedScopes = computed(() => decision.value.allowedScopes)
  const hasScopeAccess = computed(() => decision.value.hasScopeAccess)
  const canAccessScope = (scope: string | null | undefined) => {
    const normalizedScope = normalizeScope(scope)
    if (!normalizedScope) return consoleEnabled.value
    return allowedScopes.value.includes(normalizedScope)
  }

  const visibleConsoleChildren = computed(() => {
    if (!auth.isAuthenticated.value) return discoveredChildren.value
    return discoveredChildren.value.filter((entry) => canAccessScope(entry.key))
  })

  return {
    consolePath: CONSOLE_ROOT,
    isConsoleRoute,
    requestedScope,
    discoveredChildren,
    discoveredScopes,
    visibleConsoleChildren,
    explicitConsoleEnabled,
    consoleEnabled,
    allowedScopes,
    status: computed(() => decision.value.status),
    hasScopeAccess,
    canAccessScope,
    firstAllowedChild: computed(() => decision.value.firstAllowedChild),
  }
}
