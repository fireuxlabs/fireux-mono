<!-- packages/core/fireux-core/src/runtime/layouts/default.vue -->
<template>
  <div class="fx-layout-shell">
    <FireLayoutsDefaultHeader />

    <main class="fx-layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'default' })
</script>
