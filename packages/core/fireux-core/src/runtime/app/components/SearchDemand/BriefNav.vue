<template>
  <nav
    v-if="briefs.length > 1"
    aria-label="Research subject"
    class="flex flex-wrap gap-2"
  >
    <UButton
      v-for="brief in briefs"
      :key="brief.label"
      :to="brief.to"
      color="neutral"
      :variant="brief.active ? 'solid' : 'outline'"
      :aria-current="brief.active ? 'page' : undefined"
    >
      {{ brief.label }}
    </UButton>
  </nav>
</template>
<script setup lang="ts">
defineProps<{
  briefs: Array<{
    label: string
    to: { path: string; query?: { scope: string } }
    active: boolean
  }>
}>()
</script>
