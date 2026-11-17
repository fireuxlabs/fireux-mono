<template>
  <div class="templates-layout" data-template-layout>
    <FriiitesHeader />
    <FriiitesOrderBanner />

    <div class="templates-layout__page">
      <UMain><slot /></UMain>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'templates' })
</script>
