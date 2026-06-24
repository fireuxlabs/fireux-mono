<template>
  <header class="menu-header">
    <MenuStructuredHeading
      :kitchen-name="menu.presentation.kitchenName"
      :name="menu.content.name"
      :description="menu.content.description"
    />

    <MenuStructuredViewToggle
      v-if="viewModes.length > 1"
      :model-value="modelValue"
      :options="viewModes"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </header>
</template>

<script setup lang="ts">
import type { MenuManifest } from '../../../composables/fireux/public/menu/useMenuManifest'
import type { MenuView } from '../../../models/menu/menu.model'

defineProps<{
  menu: MenuManifest
  modelValue: MenuView
  viewModes: MenuView[]
}>()

defineEmits<{
  (event: 'update:modelValue', value: MenuView): void
}>()
</script>

<style scoped>
.menu-header {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}
</style>
