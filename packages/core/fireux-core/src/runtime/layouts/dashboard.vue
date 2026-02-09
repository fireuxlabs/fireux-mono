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
import { useState } from '#imports'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { NavItem } from '../../types/nav'
import { useDashboardNav } from '../composables/fireux/app/routing/presets'
import { useNavGrouping } from '../composables/fireux/app/ui/nav/useNavGrouping'
import { useAuthRedirect } from '../composables/fireux/app/ui/useAuthRedirect'
import { useDashboardNotifications } from '../composables/fireux/app/ui/useDashboardNotifications'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'

defineOptions({ name: 'dashboard' })

const open = ref(false)
const route = useRoute()
const activeProfileState = useState<string | null>(
  'fireux-dashboard-profile',
  () => null
)

const { isOpen: isNotificationsSlideoverOpen } = useDashboardNotifications()
const { desktop } = useDashboardNav()
const { isAdmin } = useUser()

const isDev = computed(() => import.meta.dev)

useAuthRedirect()

const TOP_PRIORITY = [
  { key: 'dashboard-developer', to: '/dashboard/developer' },
  { key: 'admin', to: '/dashboard/admin' },
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
  if (item.key === 'admin' || item.to === '/dashboard/admin') {
    return isAdmin.value
  }

  if (item.key === 'dashboard-developer' || item.to === '/dashboard/developer') {
    return isDev.value
  }

  return true
}

const baseNavFilter = (item: NavItem) =>
  item.group !== 'profiles' && !item.profileId && canShowNavItem(item)

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
  return desktop.value
    .filter((item) => item.group !== 'profiles')
    .filter((item) => item.profileId === profileId)
})

const { topNav, middleNav, bottomNav } = useNavGrouping(desktop, {
  topPriority: TOP_PRIORITY,
  filter: baseNavFilter,
  extras: profileExtras,
})
</script>
