<!-- CoreDashboard: Nuxt UI v4 Dashboard primitives -->
<template>
  <ClientOnly>
    <UDashboardGroup storage="local" storage-key="core-dashboard">
      <!-- Sidebar: tenant-provided navigation (collapsible/resizable) -->
      <UDashboardSidebar
        v-if="sidebarLinks.length"
        collapsible
        resizable
        :min-size="22"
        :default-size="30"
        :max-size="44"
      >
        <template #left>
          <slot name="sidebar-left" />
        </template>
        <template #header="{ collapsed }">
          <slot name="sidebar-header" :collapsed="collapsed">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-flame" class="size-5 text-primary" />
              <span v-if="!collapsed" class="font-semibold">Dashboard</span>
            </div>
          </slot>
        </template>

        <template #default="{ collapsed }">
          <slot name="sidebar-top" :collapsed="collapsed" />
          <UNavigationMenu
            :collapsed="collapsed"
            :items="sidebarLinks"
            orientation="vertical"
          />
          <UNavigationMenu
            v-if="mobileSidebarLinks.length"
            :collapsed="collapsed"
            :items="mobileSidebarLinks"
            orientation="vertical"
            class="mt-2 lg:hidden"
          />
          <slot name="sidebar-bottom" :collapsed="collapsed" />
        </template>

        <template #footer="{ collapsed }">
          <slot name="sidebar-footer" :collapsed="collapsed">
            <UButton
              :label="collapsed ? undefined : 'Account'"
              color="neutral"
              variant="ghost"
              block
              icon="i-lucide-user"
              :square="collapsed"
            />
          </slot>
        </template>
      </UDashboardSidebar>

      <!-- Main panel with Navbar and page content -->
      <UDashboardPanel>
        <template #header>
          <slot name="navbar">
            <UDashboardNavbar title="Dashboard">
              <template #leading>
                <slot name="navbar-leading">
                  <UDashboardSidebarCollapse />
                </slot>
              </template>
              <template #trailing>
                <slot name="navbar-trailing">
                  <UButton
                    icon="i-lucide-search"
                    variant="ghost"
                    color="neutral"
                  />
                  <UButton
                    icon="i-lucide-bell"
                    variant="ghost"
                    color="neutral"
                  />
                </slot>
              </template>
            </UDashboardNavbar>
          </slot>
        </template>

        <template #body>
          <NuxtPage />
        </template>

        <template #footer>
          <LayoutsDefaultFooter />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoreRoutes } from 'fireux-core/runtime/composables/app/routes/useCoreRoutes'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

// Core-composed links (system + conditional groups)
const { links } = useCoreRoutes()

// Sidebar = tenant-provided dashboard links only
const sidebarLinks = computed(
  () => (props.routes?.menuBarLinks as RouteLink[] | undefined) ?? []
)
// Mobile-only additions are rendered inside the sidebar on small screens
const mobileSidebarLinks = computed(
  () => (props.routes?.mobileLinks as RouteLink[] | undefined) ?? []
)

defineOptions({ name: 'CoreDashboard' })
</script>

<style scoped>
/* Nuxt UI dashboard components handle layout; keep CSS minimal here */
</style>
