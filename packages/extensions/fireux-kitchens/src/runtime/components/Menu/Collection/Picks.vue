<template>
  <nav class="menu-collection-picks" aria-label="Filter menus">
    <UButton
      v-for="pick in menuCollectionPickProfiles"
      :key="pick.value"
      type="button"
      size="sm"
      :icon="pick.icon"
      :color="isSelected(pick.value) ? 'primary' : 'neutral'"
      :variant="isSelected(pick.value) ? 'soft' : 'ghost'"
      :aria-pressed="isSelected(pick.value)"
      @click="toggle(pick.value)"
    >
      {{ pick.label }}
    </UButton>
  </nav>
</template>

<script setup lang="ts">
import {
  menuCollectionPickProfiles,
  type MenuCollectionPick,
} from '../../../utils/menu-collection-picks'

const props = withDefaults(defineProps<{
  modelValue?: MenuCollectionPick[]
}>(), {
  modelValue: () => [],
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: MenuCollectionPick[]): void
}>()

const isSelected = (value: MenuCollectionPick) =>
  props.modelValue.includes(value)

const toggle = (value: MenuCollectionPick) => {
  emit(
    'update:modelValue',
    isSelected(value)
      ? props.modelValue.filter((pick) => pick !== value)
      : [...props.modelValue, value]
  )
}
</script>

<style scoped>
.menu-collection-picks {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.5);
}
</style>
