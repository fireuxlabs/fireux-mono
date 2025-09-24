// CoreDashboard: Nuxt UI 4 dashboard shell

<template>
  <ClientOnly>
    <div class="dashboard-wrapper">
      <!-- Global header with top navigation and mobile menu -->
      <LayoutsHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />

      <!-- Page body uses Nuxt UI page container -->
      <UPage>
        <UPageBody>
          <div class="dashboard-content">
            <!-- Left: Sidebar (desktop only) -->
            <aside class="dashboard-sidebar" v-if="!isMobile">
              <UNavigationMenu orientation="vertical" :items="menuBarLinks" />
            </aside>

            <!-- Right: Main content -->
            <section class="dashboard-main">
              <NuxtPage />
            </section>
          </div>
        </UPageBody>
      </UPage>

      <!-- Footer -->
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

// Core base routes (top-level menu + conditional mobile items)
const { menuBarLinks: coreMenuBarLinks, mobileLinks: coreMobileLinks } =
  useCoreRoutes()

// Normalize both to arrays
const baseMenu: any[] = Array.isArray(coreMenuBarLinks)
  ? coreMenuBarLinks
  : (coreMenuBarLinks as any)?.value ?? []
const baseMobile: any[] = Array.isArray(coreMobileLinks as any)
  ? (coreMobileLinks as any)
  : (coreMobileLinks as any)?.value ?? []

// Merge with tenant-provided additions
const input = props.routes ?? {}
const menuBarLinks = computed(() => [
  ...baseMenu,
  ...(input.menuBarLinks ?? []),
])
const mobileLinks = computed(() => [
  ...baseMobile,
  ...(input.mobileLinks ?? []),
])

// Mobile detection (Header also manages a mobile slideover)
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)

defineOptions({ name: 'CoreDashboard' })
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.dashboard-content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-6);
}
.dashboard-sidebar {
  position: sticky;
  top: calc(var(--header-height, 56px) + var(--space-4));
  align-self: start;
}
.dashboard-main {
  min-width: 0; /* fix overflow in grid child */
}
@media (max-width: 1023px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
