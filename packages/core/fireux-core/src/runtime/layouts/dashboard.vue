<!-- packages/core/fireux-core/src/runtime/layouts/dashboard.vue -->
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="core-dashboard"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <!-- Top: profile switcher (self-hides when unnecessary) -->
      <template #header>
        <LayoutsDashboardProfilesMenu />
      </template>

      <!-- Main nav -->
      <template #default="{ collapsed }">
        <div class="flex flex-col gap-3">
          <UNavigationMenu
            v-if="topNav.length"
            :collapsed="collapsed ?? false"
            :items="topNav"
            orientation="vertical"
          />

          <USeparator
            v-if="topNav.length && (middleNav.length || bottomNav.length)"
          />

          <UNavigationMenu
            v-if="middleNav.length"
            :collapsed="collapsed ?? false"
            :items="middleNav"
            orientation="vertical"
          />

          <USeparator v-if="middleNav.length && bottomNav.length" />

          <UNavigationMenu
            v-if="bottomNav.length"
            :collapsed="collapsed ?? false"
            :items="bottomNav"
            orientation="vertical"
          />

          <!-- Mobile-only footer controls (shown inside the slideover) -->
          <div class="lg:hidden">
            <USeparator
              v-if="topNav.length || middleNav.length || bottomNav.length"
            />

            <div class="pt-3">
              <LayoutsDashboardSidebarFooterActions
                :collapsed="collapsed ?? false"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Bottom: user menu -->
      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsDashboardSidebarFooterActions
            :collapsed="collapsed ?? false"
            compact-profile
          />
        </div>
      </template>
    </UDashboardSidebar>

    <!-- Page content -->
    <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
      <NuxtPage />
    </div>
  </UDashboardGroup>

  <!-- Notifications slideover controlled by shared state -->
  <LayoutsDashboardNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState } from '#imports'
import { useDashboardNav } from '../composables/fireux/app/routing/presets'
import { useDashboardNotifications } from '../composables/fireux/app/ui/useDashboardNotifications'
import { useAuth } from '../composables/fireux/firebase/useAuth'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'
import type { NavItem } from '../../types/nav'

defineOptions({ name: 'dashboard' })

const open = ref(false)
const route = useRoute()
const router = useRouter()
const activeProfileState = useState<string | null>(
  'fireux-dashboard-profile',
  () => null
)

const { isOpen: isNotificationsSlideoverOpen } = useDashboardNotifications()
const { desktop } = useDashboardNav()
const { isAdmin } = useUser()

const isDev = computed(() => import.meta.dev)

const { isAuthenticated, isReady, hasAuthState, lastBindError } = useAuth()

if (import.meta.client) {
  watch(
    [isReady, hasAuthState, isAuthenticated, lastBindError],
    ([ready, resolved, authed, bindError]: [boolean, boolean, boolean, unknown]) => {
      if (!ready) return
      if (!resolved) return
      if (authed) return
      if (bindError) {
        router.replace('/').catch(() => {})
        return
      }
      router.replace('/auth').catch(() => {})
    },
    { immediate: true }
  )
}

const sortNavItems = (items: NavItem[]) =>
  items.slice().sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.label.localeCompare(b.label)
  })

const TOP_PRIORITY = [
  { key: 'dashboard-developer', to: '/dashboard/developer' },
  { key: 'admin', to: '/admin' },
  { key: 'dashboard-home', to: '/dashboard' },
  { key: 'dashboard-user-profile', to: '/dashboard/user-profile' },
]

const isTopNavItem = (item: NavItem) =>
  TOP_PRIORITY.some(
    ({ key, to }) => (key && item.key === key) || item.to === to
  )

const topPosition = (item: NavItem) =>
  TOP_PRIORITY.findIndex(
    ({ key, to }) => (key && item.key === key) || item.to === to
  )

const canShowNavItem = (item: NavItem) => {
  if (item.key === 'admin' || item.to === '/admin') {
    return isAdmin.value
  }

  if (item.key === 'dashboard-developer' || item.to === '/dashboard/developer') {
    return isDev.value
  }

  return true
}

const baseNav = computed(() =>
  sortNavItems(
    desktop.value
      .filter((i) => i.group !== 'profiles')
      .filter((i) => !i.profileId)
      .filter(canShowNavItem)
  )
)

const routeProfileId = computed(
  () => (route.meta as { nav?: { profileId?: string } }).nav?.profileId ?? null
)

watch(
  routeProfileId,
  (value: string | null) => {
    if (value && activeProfileState.value !== value) {
      activeProfileState.value = value
    }
  },
  { immediate: true }
)

const activeProfileId = computed(() => activeProfileState.value)

const profileExtras = computed(() => {
  const profileId = activeProfileId.value
  if (!profileId) return []
  return sortNavItems(
    desktop.value
      .filter((item) => item.group !== 'profiles')
      .filter((item) => item.profileId === profileId)
  )
})

const topNav = computed(() =>
  baseNav.value
    .filter(isTopNavItem)
    .sort((a, b) => topPosition(a) - topPosition(b))
    .filter((item) => topPosition(item) !== -1)
)

const bottomNav = computed(() =>
  baseNav.value.filter((item) => !isTopNavItem(item))
)

const middleNav = computed(() => sortNavItems(profileExtras.value))
</script>
