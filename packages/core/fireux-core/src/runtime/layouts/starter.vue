<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsDefaultHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <NuxtPage />
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">import { computed } from 'vue'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'

const { links } = useCoreRoutes()
const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const mobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

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
