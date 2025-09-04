// fireux-core/src/runtime/layouts/Default.vue (CoreDashboard)

<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <div class="layout-content">
        <main class="layout-main-content">
          <UNavigationMenu
            v-if="!isMobile"
            class="mt-[var(--header-height)] w-fit"
            orientation="vertical"
            :items="[]"
          />
          <div class="main-section">
            <NuxtPage />
          </div>
        </main>
      </div>
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// Nuxt auto-imported composable; declare for TS shape grace
declare function useCoreRoutes(): Promise<{
  menuBarLinks: any[]
  mobileLinks: any[]
}>
const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

const { menuBarLinks: coreMenuBarLinks, mobileLinks: coreMobileLinks } =
  await useCoreRoutes()

// Normalize core arrays (
const baseMenu: any[] = Array.isArray(coreMenuBarLinks)
  ? coreMenuBarLinks
  : ((coreMenuBarLinks as any)?.value ?? [])
const baseMobile: any[] = Array.isArray(coreMobileLinks as any)
  ? (coreMobileLinks as any)
  : ((coreMobileLinks as any)?.value ?? [])

const input = props.routes ?? {}
const menuBarLinks = [...baseMenu, ...(input.menuBarLinks ?? [])]
const mobileLinks = [...baseMobile, ...(input.mobileLinks ?? [])]

// Conservative placeholder; replace with real device check if available
const isMobile: boolean = false

defineOptions({
  name: 'CoreDashboard',
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.layout-content {
  display: flex;
  flex-direction: column;
  max-width: 1800px;
  width: 100%;
}
.layout-main-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: row;
  align-items: start;
}
.main-section {
  flex: 1;
  width: 100%;
}
</style>
