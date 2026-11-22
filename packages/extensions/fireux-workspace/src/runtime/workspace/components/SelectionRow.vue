<template>
  <UButton
    type="button"
    :to="to"
    color="neutral"
    :variant="selected ? 'soft' : 'ghost'"
    class="workspace-selection-row"
    :aria-pressed="to ? undefined : selected"
    @click="$emit('select')"
  >
    <slot />
  </UButton>
</template>
<script setup lang="ts">
defineProps<{ selected: boolean; to?: string }>()
defineEmits<{ select: [] }>()
</script>
<style scoped>
.workspace-selection-row {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  justify-content: flex-start;
  text-align: start;
}
</style>
