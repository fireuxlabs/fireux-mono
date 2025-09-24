<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <NuxtPage />
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
declare function useCoreRoutes(): any
const coreRoutes = useCoreRoutes()

// --- Menu bar: always the four system links ---
const menuBarLinks = coreRoutes.links.filter((r: any) =>
  ['home', 'products', 'blog', 'users'].includes(r.id)
)

// --- Mobile: system + groups (user + admin) ---
const mobileLinks = coreRoutes.links.filter((r: any) =>
  [
    'home',
    'products',
    'blog',
    'users',
    'user', // user group (children inside)
    'admin', // admin group (children inside)
  ].includes(r.id)
)
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
