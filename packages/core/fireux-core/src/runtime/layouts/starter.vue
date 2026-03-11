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

<script setup lang="ts">
import { computed } from 'vue'
import { useDefaultNav } from '../composables/fireux/app/routing/useDefaultNav'
const nav = useDefaultNav()
const menuBarLinks = computed(() => nav.desktop.value)
const mobileLinks = computed(() => nav.mobile.value)

defineOptions({ name: 'starter' })
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
