<!-- packages/core/fireux-core/src/runtime/layouts/CoreDefault.vue -->
<template>
  <div class="layout-wrapper">
    <LayoutsDefaultHeader
      :menu-bar-links="menuBarLinks"
      :mobile-links="mobileLinks"
    />

    <main class="layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '../composables/app/nav/useNav'

defineOptions({ name: 'CoreDefault' })

// Meta-driven nav (Header also derives its own; these are fallbacks for props-only mode)
const nav = useNav()
const menuBarLinks = computed(() => nav.desktop.value)
const mobileLinks = computed(() => nav.mobile.value)
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-main {
  flex: 1;
  padding-block: var(--spacing-m);
}
</style>
