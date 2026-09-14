<template>
  <header class="flex items-center gap-4 border-b border-default px-6 py-6 sm:px-8">
    <AppBrandLogo
      size="large"
      :alt="`${appLabel} logo`"
      class="size-10 rounded-xl object-contain"
    />
    <h1 class="text-xl font-semibold tracking-tight text-highlighted">
      Finish setting up
    </h1>
  </header>
</template>

<script setup lang="ts">
defineProps<{ appLabel: string }>()
</script>
