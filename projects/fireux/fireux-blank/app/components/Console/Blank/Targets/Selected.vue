<template>
  <section class="space-y-2">
    <pre>ConsoleBlankTargetsSelected</pre>

    <UPageCard
      v-if="selectedId"
      title="Selected Blank"
      :description="selectedId"
      variant="subtle"
    />

    <UPageCard
      v-else
      title="No selected Blank"
      description="Choose a live Blank target to test selected-target console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  selectedId?: string
}>()
</script>
