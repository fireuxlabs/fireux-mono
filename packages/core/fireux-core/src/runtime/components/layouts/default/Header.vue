<!-- packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue -->
<!-- Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: replace the Premium-only header badge with the derived tier. -->
<template>
  <ClientOnly>
    <!-- Single-source mobile toggle via UHeader -->
    <UHeader mode="slideover" data-fireux-header-root>
      <!-- Brand -->
      <template #title>
        <NuxtLink to="/" aria-label="Home">
          <AppBrandWordmark size="large" />
        </NuxtLink>
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
          <!-- Signed out => Sign in -->
          <UButton
            v-if="authPhase === 'guest'"
            to="/auth"
            size="sm"
            color="primary"
            variant="solid"
            data-fireux-header-cta
          >
            Sign in
          </UButton>

          <!-- Signed in => dashboard -->
          <template v-else-if="isSignedIn">
            <UserAccessBadge :tier="accessTier" />

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
import { computed } from '#imports'
import { useRoute } from 'vue-router'
import { useConsoleEntryState } from '../../../composables/fireux/console/useConsoleEntryState'
import { useNav } from '../../../composables/navigation/useNav'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../user/composables/useUser'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to current layout) */
const route = useRoute()
const currentLayout = computed(() =>
  typeof route.meta?.layout === 'string' && route.meta.layout.trim().length > 0
    ? route.meta.layout
    : 'default'
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
const { authPhase, isSignedIn } = useConsoleEntryState()
const { currentUser, avatarSrc, accessTier } = useUser()
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

  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'U'
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
