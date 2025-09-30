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
import { useDashboardNav } from '../composables/app/nav/useDashboardNav'
import type { DashboardItem } from '../composables/app/nav/useDashboardNav'

const open = ref(false)

// Minimal placeholders for Profiles menu until wired from tenant/app
type ProfileItem = {
  id: string
  label: string
  icon?: string
  avatar?: { src: string; alt?: string }
  description?: string
}
const profiles = ref<ProfileItem[]>([])
const activeProfileId = ref<string | null>(null)

// Dashboard links from route meta
const { primary, secondary } = useDashboardNav()

const links = computed<NavigationMenuItem[][]>(() => [
  primary.value.map((i: DashboardItem) => ({
    label: i.label,
    icon: i.icon,
    to: i.to,
    onSelect: () => {
      open.value = false
    },
  })),
  secondary.value.map((i: DashboardItem) => ({
    label: i.label,
    icon: i.icon,
    to: i.to,
    onSelect: () => {
      open.value = false
    },
  })),
])

const groups = computed(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.value.flat(),
  },
])

defineOptions({ name: 'CoreDashboard' })
</script>
