<template>
  <header class="flex items-center gap-4 px-6 py-6 sm:px-8">
    <AppBrandLogo
      size="large"
      :alt="`${appLabel} logo`"
      class="size-10 object-contain"
    />
    <h1>Finish setting up</h1>
  </header>
</template>

<script setup lang="ts">
defineProps<{ appLabel: string }>()
</script>
