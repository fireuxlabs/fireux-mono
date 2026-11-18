<template>
  <header class="menu-controls-actions">
    <h2 class="fx-type-label">Your menus</h2>
    <UButton
      label="Add menu"
      icon="i-lucide-plus"
      :disabled="disabled"
      @click="emit('create')"
    />
  </header>
</template>
<script setup lang="ts">
defineProps<{ disabled: boolean }>()
const emit = defineEmits<{ create: [] }>()
</script>
<style scoped>
.menu-controls-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
.menu-controls-actions h2 {
  margin: 0;
}
</style>
