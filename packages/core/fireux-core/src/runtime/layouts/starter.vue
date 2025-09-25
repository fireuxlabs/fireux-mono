<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsHeader :menu-bar-links="menuBarLinks" :mobile-links="mobileLinks" />
      <slot />
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const { links } = useCoreRoutes()
const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() => links.value.filter((r) => KEEP_MENU.has(r.id)))
const mobileLinks = computed(() => links.value.filter((r) => KEEP_MOBILE.has(r.id)))

defineOptions({ name: 'CoreStarter' })
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
