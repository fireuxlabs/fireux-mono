<!-- CoreDashboard: Focused shell using Nuxt UI group + our global header -->
<template>
  <ClientOnly>
    <UDashboardGroup unit="rem">
      <!-- Our global header for top navigation and mobile menu -->
      <LayoutsHeader :menu-bar-links="navMenu" :mobile-links="navMobile" />

      <!-- Sidebar (desktop only) with tenant-provided dashboard links -->
      <UDashboardSidebar
        v-if="!isMobile && sidebarLinks.length"
        collapsible
        resizable
        class="bg-elevated/25"
        :ui="{ footer: 'lg:border-t lg:border-default' }"
      >
        <template #default="{ collapsed }">
          <UNavigationMenu
            orientation="vertical"
            :collapsed="collapsed"
            :items="sidebarLinks"
            tooltip
            popover
          />
        </template>
      </UDashboardSidebar>

      <!-- Main content area -->
      <UPage>
        <UPageBody>
          <NuxtPage />
        </UPageBody>
      </UPage>

      <LayoutsDefaultFooter />
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useCoreRoutes } from 'fireux-core/runtime/composables/app/routes/useCoreRoutes'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

const props = defineProps<{
  routes?: { menuBarLinks?: RouteLink[]; mobileLinks?: RouteLink[] }
}>()

// Core-composed links (system + conditional groups)
const { links } = useCoreRoutes()

// Header allow-lists (unchanged)
const KEEP_HEADER_MENU = new Set<RouteLink['id']>(['home', 'products', 'blog', 'users'])
const KEEP_HEADER_MOBILE = new Set<RouteLink['id']>(['products', 'blog', 'users', 'user', 'admin'])

const coreMenu = computed(() => links.value.filter((r: RouteLink) => KEEP_HEADER_MENU.has(r.id)))
const coreMobile = computed(() => links.value.filter((r: RouteLink) => KEEP_HEADER_MOBILE.has(r.id)))

// Merge tenant additions
const navMenu = computed(() => [
  ...coreMenu.value,
  ...((props.routes?.menuBarLinks as RouteLink[] | undefined) ?? []),
])
const navMobile = computed(() => [
  ...coreMobile.value,
  ...((props.routes?.mobileLinks as RouteLink[] | undefined) ?? []),
])

// Sidebar is tenant dashboard links only
const sidebarLinks = computed(() => (props.routes?.menuBarLinks as RouteLink[] | undefined) ?? [])

// Mobile detection for hiding the sidebar
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)

defineOptions({ name: 'CoreDashboard' })
</script>

<style scoped>
/* Nuxt UI components handle most layout; minimal extras here. */
</style>
