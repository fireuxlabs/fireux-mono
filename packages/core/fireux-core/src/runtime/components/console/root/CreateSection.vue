<template>
  <template v-if="visible">
    <USeparator />

    <section class="space-y-3">
      <div class="space-y-1">
        <p class="text-sm font-medium text-highlighted">{{ title }}</p>
        <p v-if="description" class="text-sm text-dimmed">
          {{ description }}
        </p>
      </div>

      <slot />
    </section>
  </template>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  description?: string
}>()
</script>
