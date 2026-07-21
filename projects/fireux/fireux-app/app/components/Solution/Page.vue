<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the FireUX authored solution-page shell. -->
<template>
  <PublicSimplePage
    :title="title"
    :description="description"
    eyebrow="FireUX solution"
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <slot />
    </div>

    <template #actions>
      <slot name="actions" />
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
