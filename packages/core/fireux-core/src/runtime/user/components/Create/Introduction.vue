<template>
  <header>
    <AppBrandLogo size="large" :alt="`${appLabel} logo`" />
    <h1>Finish setting up</h1>
  </header>
</template>

<script setup lang="ts">
defineProps<{ appLabel: string }>()
</script>
