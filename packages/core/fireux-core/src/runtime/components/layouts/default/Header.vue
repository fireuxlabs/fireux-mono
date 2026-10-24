<!-- packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue -->
<!-- Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: replace the Premium-only header badge with the derived tier. -->
<template>
  <ClientOnly>
    <!-- Single-source mobile toggle via UHeader -->
    <UHeader :title="appName" to="/" mode="slideover" data-fireux-header-root>
      <!-- Brand -->
      <template #title>
        <AppBrandWordmark size="large" />
      </template>

      <!-- Desktop nav (hidden on mobile by Nuxt UI) -->
      <div data-fireux-header-center>
        <UNavigationMenu
          v-if="desktopItems.length"
          orientation="horizontal"
          :items="desktopItems"
        />
      </div>

      <!-- Right side: auth funnel -->
      <template #right>
        <div
          data-fireux-header-right
          class="flex items-center justify-end gap-1.5"
        >
          <UButton
            v-if="hasWorkspaceEntry"
            :to="workspaceEntryHref"
            size="sm"
            color="neutral"
            variant="soft"
            icon="i-lucide-panels-top-left"
            label="Workspace"
          />
          <!-- Signed out => Sign in -->
          <UButton
            v-if="authPhase === 'guest'"
            :to="{ path: '/auth', query: { redirect: route.fullPath } }"
            size="sm"
            color="primary"
            variant="solid"
            data-fireux-header-cta
          >
            Sign in
          </UButton>

          <!-- Signed in => dashboard -->
          <template v-else-if="isSignedIn">
            <UserAccessBadge :subscription="subscription" />

            <UButton
              to="/dashboard"
              variant="ghost"
              color="neutral"
              aria-label="Open Dashboard"
              data-fireux-header-avatar
            >
              <UAvatar
                :src="headerAvatarSrc"
                :alt="headerAvatarName || 'User avatar'"
                :text="headerAvatarText"
                size="sm"
              />
            </UButton>
          </template>

          <USkeleton v-else class="h-8 w-8 rounded-full" />
        </div>
      </template>

      <!-- Mobile panel content -->
      <template #body>
        <UNavigationMenu
          v-if="mobileItems.length"
          orientation="vertical"
          :items="mobileItems"
        />
      </template>
    </UHeader>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useWorkspaceEntryCta } from '../../../workspace/composables/useWorkspaceEntryCta'
import { useUserSession } from '../../../user/composables/session/useUserSession'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceEntryState } from '../../../workspace/composables/useWorkspaceEntryState'
import { useNav } from '../../../composables/navigation/useNav'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (scoped to the layout Nuxt actually resolved) */
const { appName } = useFireUXConfig()
const route = useRoute()
const { hasWorkspaceEntry, workspaceEntryHref } = useWorkspaceEntryCta()
const currentLayout = computed(() =>
  typeof route.meta.layout === 'string' ? route.meta.layout : 'default'
)
const { desktop, mobile } = useNav(currentLayout)

const normalizePath = (value: unknown) => {
  const path = String(value ?? '').trim() || '/'
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}
const isHomeNavItem = (item: { key?: string; to?: string }) =>
  item.key === 'home' || normalizePath(item.to) === '/'

const desktopItems = computed(() =>
  Array.isArray(desktop.value)
    ? desktop.value
        .filter(Boolean)
        .filter((item) => !isHomeNavItem(item))
        .filter((item) => item.position !== 'bottom')
        .filter((item) => normalizePath(item.to) !== normalizePath(route.path))
    : []
)
const mobileItems = computed(() =>
  Array.isArray(mobile.value)
    ? mobile.value
        .filter(Boolean)
        .filter((item) => !isHomeNavItem(item))
        .filter((item) => item.position !== 'bottom')
    : []
)

/** Auth */
const { authPhase, isSignedIn } = useWorkspaceEntryState()
const { currentUser, avatarSrc, subscription } = useUserSession()
const { currentUser: authUser } = useAuth()
const { getProxiedAvatarUrl } = useAvatarProxy()
const headerAvatarName = computed(() =>
  String(
    currentUser.value?.display_name || authUser.value?.displayName || ''
  ).trim()
)

const headerAvatarText = computed(() => {
  const name = headerAvatarName.value
  if (!name) return 'U'

  const [first, second] = name.split(/\s+/).filter(Boolean)
  if (!first) return 'U'

  if (!second) {
    return first.slice(0, 2).toUpperCase()
  }

  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase() || 'U'
})
const headerAvatarSrc = computed(() => {
  const authAvatar =
    typeof authUser.value?.photoURL === 'string'
      ? authUser.value.photoURL.trim()
      : ''
  const resolved = avatarSrc.value || ''
  const proxied = getProxiedAvatarUrl(resolved || authAvatar || undefined)
  return proxied || undefined
})
</script>
