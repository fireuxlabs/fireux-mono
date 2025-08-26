<template>
  <div class="layout-wrapper">
    <FireLayoutsHeader
      :menu-bar-links="menuBarLinks"
      :mobile-links="mobileLinks"
    />
    <NuxtPage />
    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup>
// FireUX uses pure core - no additional routes needed
const coreRoutes = await useCoreRoutes()
const menuBarLinks = [
  ...(Array.isArray(coreRoutes.menuBarLinks) ? coreRoutes.menuBarLinks : []),
]
const mobileLinks = [
  ...(Array.isArray(coreRoutes.mobileLinks) ? coreRoutes.mobileLinks : []),
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
