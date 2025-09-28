<!-- packages/core/fireux-core/src/runtime/layouts/dashboard.vue -->
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <LayoutsDashboardProfilesMenu
          :collapsed="collapsed"
          :profiles="profiles"
          v-model:active-id="activeProfileId"
          :show-add="true"
        />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <LayoutsDashboardUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <!-- Dashboard page content -->
    <NuxtPage />

    <LayoutsDashboardNotificationsSlideover />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

// Minimal dummy data for ProfilesMenu (replace from tenant/app later)
type ProfileItem = {
  id: string
  label: string
  icon?: string
  avatar?: string
  description?: string
}

const profiles = ref<ProfileItem[]>([
  { id: 'p-1', label: 'Acme Inc.', icon: 'i-lucide-building-2' },
  { id: 'p-2', label: 'Globex', icon: 'i-lucide-briefcase' },
  { id: 'p-3', label: 'Initech', icon: 'i-lucide-badge-cent' },
])
const activeProfileId = ref<string | null>(profiles.value[0]?.id ?? null)

const links = [
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/user-profile',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Purchases',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/purchases',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Favorites',
      icon: 'i-lucide-heart',
      to: '/dashboard/favorites',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      defaultOpen: true,
      type: 'trigger',
      children: [
        {
          label: 'General',
          to: '/dashboard/settings',
          exact: true,
          onSelect: () => {
            open.value = false
          },
        },
        // Followers page lives at /dashboard/followers per IA (not a settings child)
        {
          label: 'Notifications',
          to: '/dashboard/settings/notifications',
          onSelect: () => {
            open.value = false
          },
        },
        {
          label: 'Authentication',
          to: '/dashboard/settings/authentication',
          onSelect: () => {
            open.value = false
          },
        },
      ],
    },
  ],
  [],
] satisfies NavigationMenuItem[][]

const groups = computed(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.flat(),
  },
  {
    id: 'code',
    label: 'Code',
    items: [
      {
        id: 'source',
        label: 'View page source',
        icon: 'i-simple-icons-github',
        to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${
          route.path === '/' ? '/index' : route.path
        }.vue`,
        target: '_blank',
      },
    ],
  },
])

defineOptions({ name: 'CoreDashboard' })
</script>
