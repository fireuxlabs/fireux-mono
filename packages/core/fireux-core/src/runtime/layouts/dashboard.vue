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
            :collapsed="collapsed"
            :items="topNav"
            orientation="vertical"
          />

          <USeparator
            v-if="topNav.length && (middleNav.length || bottomNav.length)"
          />

          <UNavigationMenu
            v-if="middleNav.length"
            :collapsed="collapsed"
            :items="middleNav"
            orientation="vertical"
          />

          <USeparator v-if="middleNav.length && bottomNav.length" />

          <UNavigationMenu
            v-if="bottomNav.length"
            :collapsed="collapsed"
            :items="bottomNav"
            orientation="vertical"
          />
        </div>
      </template>

      <!-- Bottom: user menu -->
      <template #footer>
        <OrganismsUserCardsPill
          v-if="pillUser"
          :user="pillUser"
          :show-memberships="false"
          class="w-full"
        />
      </template>
    </UDashboardSidebar>

    <!-- Page content -->
    <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
      <NuxtPage />
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useState } from '#imports'
import { useDashboardNav } from 'fireux-core/runtime/composables/fireux/app/routing/nav/presets.ts'
import { useUser } from '../composables/fireux/firestore/core/user/useUser.ts'
import type { UserCard } from '../models/core/user.model.ts'
import type { NavItem } from '../types/nav'

defineOptions({ name: 'CoreDashboard' })

type ProfileNavConfig = {
  key: string
  label: string
  to: string
  order?: number
  icon?: string
}

const PROFILE_NAV_EXTRAS: Record<string, ProfileNavConfig[]> = {
  agent: [
    {
      key: 'dashboard-agent-home',
      label: 'Agent',
      to: '/dashboard/agent',
      order: 210,
      icon: 'i-lucide-shield-user',
    },
    {
      key: 'dashboard-agent-profile',
      label: 'Profile',
      to: '/dashboard/agent/profile',
      order: 211,
      icon: 'i-lucide-file-user',
    },
    {
      key: 'dashboard-agent-my-gigs',
      label: 'My Gigs',
      to: '/dashboard/agent/my-gigs',
      order: 212,
      icon: 'i-lucide-radio-tower',
    },
  ],
  professional: [
    {
      key: 'dashboard-professional-home',
      label: 'Professional',
      to: '/dashboard/professional',
      order: 220,
      icon: 'i-lucide-user-star',
    },
    {
      key: 'dashboard-professional-extra-1',
      label: 'Profile',
      to: '/dashboard/professional/profile',
      order: 221,
      icon: 'i-lucide-file-user',
    },
    {
      key: 'dashboard-professional-extra-2',
      label: 'My Jobs',
      to: '/dashboard/professional/my-jobs',
      order: 222,
      icon: 'i-lucide-briefcase-business',
    },
  ],
  chef: [
    {
      key: 'dashboard-chef-home',
      label: 'Chef',
      to: '/dashboard/chef',
      order: 230,
      icon: 'i-lucide-chef-hat',
    },
    {
      key: 'dashboard-chef-profile',
      label: 'Profile',
      to: '/dashboard/chef/profile',
      order: 231,
      icon: 'i-lucide-file-user',
    },
    {
      key: 'dashboard-chef-recipes',
      label: 'My Recipes',
      to: '/dashboard/chef/my-recipes',
      order: 232,
      icon: 'i-lucide-book-open',
    },
  ],
  supplier: [
    {
      key: 'dashboard-supplier-home',
      label: 'Supplier',
      to: '/dashboard/supplier',
      order: 240,
      icon: 'i-lucide-package',
    },
    {
      key: 'dashboard-supplier-profile',
      label: 'Profile',
      to: '/dashboard/supplier/profile',
      order: 241,
      icon: 'i-lucide-file-user',
    },
    {
      key: 'dashboard-supplier-stock',
      label: 'My Stock',
      to: '/dashboard/supplier/my-stock',
      order: 242,
      icon: 'i-lucide-box',
    },
  ],
}

const open = ref(false)
const route = useRoute()
const activeProfileState = useState<string | null>(
  'fireux-dashboard-profile',
  () => null
)
const { desktop } = useDashboardNav()
const { isAdmin, user, pillProps } = useUser()

const pillUser = computed<UserCard.Pill | undefined>(() => {
  const current = user.value
  if (!current) return undefined
  const base = pillProps(current)
  if (!base) return undefined
  return {
    ...base,
    to: '/dashboard/user-profile',
  }
})

const sortNavItems = (items: NavItem[]) =>
  items.slice().sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.label.localeCompare(b.label)
  })

const TOP_PRIORITY = [
  { key: 'dashboard-app', to: '/dashboard/app' },
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

const baseNav = computed(() =>
  sortNavItems(
    desktop.value
      .filter((i) => i.group !== 'profiles')
      .filter((item) => {
        if (item.key === 'dashboard-app' || item.to === '/dashboard/app') {
          return isAdmin.value
        }
        return true
      })
  )
)

const profileNavItems = computed(() =>
  desktop.value.filter((item) => item.group === 'profiles')
)

const routeProfileId = computed(
  () => (route.meta as { nav?: { profileId?: string } }).nav?.profileId ?? null
)

watch(
  routeProfileId,
  (value) => {
    if (value && activeProfileState.value !== value) {
      activeProfileState.value = value
    }
  },
  { immediate: true }
)

const activeProfileId = computed(() => activeProfileState.value)

const activeProfileNav = computed(() =>
  profileNavItems.value.find((item) => item.profileId === activeProfileId.value)
)

const profileExtras = computed<NavItem[]>(() => {
  const profileId = activeProfileId.value
  if (!profileId) return []
  const extras = PROFILE_NAV_EXTRAS[profileId] ?? []
  const profileIcon = activeProfileNav.value?.icon ?? 'i-lucide-user'
  return extras.map((item, index) => ({
    key: item.key,
    label: item.label,
    icon: item.icon ?? profileIcon,
    to: item.to,
    group: 'profile-extra',
    profileId,
    order: item.order ?? 300 + index,
    desktop: true,
    mobile: false,
    layouts: ['dashboard'],
  }))
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
