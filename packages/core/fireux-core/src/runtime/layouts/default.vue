<template>
  <div class="layout-wrapper">
    <LayoutsHeader :menu-bar-links="menuBarLinks" :mobile-links="mobileLinks" />
    <NuxtPage />
    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
// Nuxt auto-imported composable; declare for TS when type context misses auto-imports
declare function useCoreRoutes(): Promise<any>
const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

const coreRoutes = await useCoreRoutes()
const menuBarLinks = [
  ...(Array.isArray(coreRoutes.menuBarLinks) ? coreRoutes.menuBarLinks : []),
  ...(Array.isArray(props.routes?.menuBarLinks)
    ? props.routes.menuBarLinks
    : []),
]
const mobileLinks = [
  ...(Array.isArray(coreRoutes.mobileLinks) ? coreRoutes.mobileLinks : []),
  ...(Array.isArray(props.routes?.mobileLinks) ? props.routes.mobileLinks : []),
]
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.layout-wrapper > * {
  align-self: stretch;
}
</style>
