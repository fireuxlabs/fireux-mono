<!-- packages/core/fireux-core/src/runtime/layouts/default.vue -->
<template>
  <div class="fx-layout-shell">
    <FireLayoutsDefaultHeader />

    <div class="fx-layout-main">
      <UContainer>
        <slot />
      </UContainer>
    </div>

    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'default' })
</script>
