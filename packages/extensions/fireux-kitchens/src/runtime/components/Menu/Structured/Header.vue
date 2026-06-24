<template>
  <header class="menu-header">
    <MenuStructuredHeading
      :kitchen-name="menu.presentation.kitchenName"
      :name="menu.content.name"
      :description="menu.content.description"
    />

    <MenuStructuredChoiceToggle
      v-if="choices.length > 1"
      :model-value="modelValue"
      :options="choices"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </header>
</template>

<script setup lang="ts">
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../composables/fireux/public/menu/useMenuViewMode'
import type { MenuManifest } from '../../../composables/fireux/public/menu/useMenuManifest'

defineProps<{
  menu: MenuManifest
  modelValue: MenuChoiceValue
  choices: MenuChoiceOption[]
}>()

defineEmits<{
  (event: 'update:modelValue', value: MenuChoiceValue): void
}>()
</script>

<style scoped>
.menu-header {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}
</style>
