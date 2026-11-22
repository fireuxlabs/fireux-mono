<template>
  <ClientOnly>
    <UHeader :title="appName" to="/" mode="slideover" data-fireux-header-root>
      <template #title>
        <AppBrandWordmark size="large" />
      </template>

      <div data-fireux-header-center>
        <UNavigationMenu
          v-if="desktopItems.length"
          orientation="horizontal"
          :items="desktopItems"
        />
      </div>

      <template #right>
        <div data-fireux-header-right class="fx-header-actions">
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

          <template v-else-if="isSignedIn">
            <AppUserAccessBadge
              class="fx-header-desktop-action"
              :subscription="subscription"
            />

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

          <USkeleton v-else class="fx-header-avatar-placeholder" />
        </div>
      </template>

      <template #body>
        <div v-if="isSignedIn && subscription" class="fx-header-menu-actions">
          <div class="fx-header-menu-membership">
            <span>Your plan</span>
            <AppUserAccessBadge :subscription="subscription" />
          </div>
        </div>
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
import { useUserSession } from '../../../user/composables/session/useUserSession'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthPhase } from '../../../composables/fireux/firebase/useAuthPhase'
import { useNav } from '../../../composables/navigation/useNav'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

defineOptions({ name: 'FireLayoutsDefaultHeader' })

/** Nav (scoped to the layout Nuxt actually resolved) */
const { appName } = useFireUXConfig()
const route = useRoute()
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
const { authPhase, isSignedIn } = useAuthPhase()
const { user, avatarSrc, subscription } = useUserSession()
const { currentUser: authUser } = useAuth()
const { getProxiedAvatarUrl } = useAvatarProxy()
const headerAvatarName = computed(() =>
  String(user.value?.display_name || authUser.value?.displayName || '').trim()
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

<style scoped>
.fx-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) * 1.5);
}
.fx-header-avatar-placeholder {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  border-radius: 999px;
}
.fx-header-desktop-action {
  display: none;
}
.fx-header-menu-actions,
.fx-header-menu-membership {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}
.fx-header-menu-actions {
  padding-block-end: calc(var(--spacing) * 4);
}
.fx-header-menu-membership {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
@media (min-width: 64rem) {
  .fx-header-desktop-action {
    display: inline-flex;
  }
}
</style>
