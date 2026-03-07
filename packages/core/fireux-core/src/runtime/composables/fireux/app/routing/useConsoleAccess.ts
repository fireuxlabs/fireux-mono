import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../firebase/useAuth'
import { useUser } from '../../firestore/core/user/useUser'
import {
  discoverConsoleChildren,
  getConsoleScopeFromPath,
  isConsoleRoutePath,
  normalizeConsolePath,
  normalizeConsoleScope,
} from './consoleRoutes'

type UseConsoleAccessOptions = {
  consolePath?: string
  targetPath?: MaybeRefOrGetter<string | null | undefined>
}

function asScopeList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => normalizeConsoleScope(entry))
    .filter(Boolean)
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

export function useConsoleAccess(options: UseConsoleAccessOptions = {}) {
  const router = useRouter()
  const auth = useAuth()
  const { appUser, isAdmin } = useUser()

  const consolePath = normalizeConsolePath(options.consolePath)

  const discoveredChildren = computed(() =>
    discoverConsoleChildren(router.getRoutes(), consolePath)
  )

  const discoveredScopes = computed(() =>
    discoveredChildren.value.map((entry) => entry.key)
  )

  const requestedPath = computed(() => String(toValue(options.targetPath) || '').trim())
  const isConsoleRoute = computed(() =>
    isConsoleRoutePath(requestedPath.value, consolePath)
  )
  const requestedScope = computed(() =>
    getConsoleScopeFromPath(requestedPath.value, consolePath)
  )

  const explicitConsoleEnabled = computed(() =>
    typeof appUser.value?.console_enabled === 'boolean'
      ? appUser.value.console_enabled
      : null
  )

  const explicitScopes = computed(() => asScopeList(appUser.value?.console_scopes))

  const consoleEnabled = computed(() => {
    return resolveConsoleEnabled(
      auth.isAuthenticated.value,
      appUser.value,
      isAdmin.value
    )
  })

  const allowedScopes = computed(() => {
    if (!consoleEnabled.value) return []
    return resolveAllowedConsoleScopes(
      { console_scopes: explicitScopes.value },
      isAdmin.value,
      discoveredScopes.value
    )
  })

  const canAccessScope = (scope: string | null | undefined) => {
    const normalizedScope = normalizeConsoleScope(scope)
    if (!normalizedScope) return consoleEnabled.value
    return consoleEnabled.value && allowedScopes.value.includes(normalizedScope)
  }

  const hasScopeAccess = computed(() => canAccessScope(requestedScope.value))

  const visibleConsoleChildren = computed(() => {
    if (!auth.isAuthenticated.value) return discoveredChildren.value
    return discoveredChildren.value.filter((entry) => canAccessScope(entry.key))
  })

  return {
    consolePath,
    isConsoleRoute,
    requestedScope,
    discoveredChildren,
    discoveredScopes,
    visibleConsoleChildren,
    explicitConsoleEnabled,
    consoleEnabled,
    allowedScopes,
    hasScopeAccess,
    canAccessScope,
  }
}
