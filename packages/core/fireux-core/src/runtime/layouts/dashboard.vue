Understood — you want the marker texts just as standalone text nodes in the layout (not wrapped in any element). Here’s that version:

<!-- packages/core/fireux-core/src/runtime/layouts/dashboard.vue -->
<template>
  <ClientOnly>
    group start
    <UDashboardGroup unit="rem">
      sidebar
      <UDashboardSidebar
        id="core-dashboard"
        v-model:open="open"
        collapsible
        resizable
        class="bg-elevated/25"
        :ui="{ footer: 'lg:border-t lg:border-default' }"
      >
        profilesmenu
        <template #header="{ collapsed }">
          <LayoutsDashboardProfilesMenu :collapsed="collapsed" />
        </template>

        <template #default="{ collapsed }">
          searchbutton
          <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

          primary nav
          <UNavigationMenu
            :collapsed="collapsed"
            :items="sidebarPrimary"
            orientation="vertical"
            tooltip
            popover
          />

          secondary nav
          <UNavigationMenu
            v-if="sidebarSecondary.length"
            :collapsed="collapsed"
            :items="sidebarSecondary"
            orientation="vertical"
            tooltip
            class="mt-auto"
          />
        </template>

        <template #footer="{ collapsed }">
          usermenu footer
          <LayoutsDashboardUserMenu :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>

      dashboard search
      <UDashboardSearch :groups="searchGroups" />

      main content
      <UPage>
        <UPageBody>
          NuxtPage
          <NuxtPage />
        </UPageBody>
      </UPage>

      footer start
      <LayoutsDefaultFooter />
    </UDashboardGroup>
    group end
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'
import type { RouteLink } from '../types/routeLink'

const props = defineProps<{ routes?: { menuBarLinks?: RouteLink[]; mobileLinks?: RouteLink[] } }>()

const open = ref(false)
const { links } = useCoreRoutes()

const CORE_GROUP_IDS = new Set<RouteLink['id']>(['user', 'admin'])
const coreGroups = computed(() => links.value.filter(l => CORE_GROUP_IDS.has(l.id)))

const sidebarPrimary = computed<RouteLink[]>(() => props.routes?.menuBarLinks ?? [])
const sidebarSecondary = computed<RouteLink[]>(() => coreGroups.value)

const searchGroups = computed(() => [
  {
    id: 'core',
    label: 'Navigate',
    items: [...sidebarPrimary.value, ...sidebarSecondary.value]
  }
])
</script>

<style scoped>
/* No styling for these markers — they are raw text nodes */
</style>

