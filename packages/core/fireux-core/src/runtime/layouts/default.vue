<!-- packages/core/fireux-core/src/runtime/layouts/default.vue -->
<template>
  <div class="layout-wrapper">
    <LayoutsDefaultHeader />

    <main class="layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav.ts'

defineOptions({ name: 'default' })

if (import.meta.dev) {
  const navDebug = useNav()

  watchEffect(() => {
    console.debug('[core-default:nav]', {
      items: navDebug.items.value,
      desktop: navDebug.desktop.value,
      mobile: navDebug.mobile.value,
    })
  })
}
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
