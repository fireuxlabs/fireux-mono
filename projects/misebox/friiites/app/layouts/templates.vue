<template>
  <div class="templates-layout" data-template-layout>
    <FriiitesHeader />
    <FriiitesOrderBanner />

    <div class="templates-layout__page">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'templates' })
</script>
