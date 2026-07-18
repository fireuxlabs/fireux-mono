<!-- packages/core/fireux-core/src/runtime/layouts/default.vue -->
<template>
  <div class="fx-layout-shell">
    <LayoutsDefaultHeader />

    <main class="fx-layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'default' })
</script>
