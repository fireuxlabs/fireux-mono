<template>
  <section
    class="grid min-h-[20rem] place-items-center py-4"
    :aria-label="`${title} preview`"
  >
    <UAlert
      color="neutral"
      variant="subtle"
      :icon="icon"
      :title="title"
      :description="description"
      class="w-full max-w-md"
    />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
}>()
</script>
