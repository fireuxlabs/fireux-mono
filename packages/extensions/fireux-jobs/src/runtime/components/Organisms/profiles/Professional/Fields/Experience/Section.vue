<template>
  <section class="space-y-4">
    <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>
