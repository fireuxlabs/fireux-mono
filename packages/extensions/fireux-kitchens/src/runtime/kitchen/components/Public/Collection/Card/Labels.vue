<template>
  <section
    v-if="labels.length"
    :aria-label="label"
    class="kitchen-discovery-labels"
  >
    <UBadge
      v-for="item in labels"
      :key="item"
      :color="color"
      :variant="variant"
      >{{ item }}</UBadge
    >
  </section>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    labels: string[]
    color?: 'neutral' | 'primary'
    variant?: 'soft' | 'outline'
  }>(),
  { color: 'neutral', variant: 'soft' }
)
</script>
<style scoped>
.kitchen-discovery-labels {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
</style>
