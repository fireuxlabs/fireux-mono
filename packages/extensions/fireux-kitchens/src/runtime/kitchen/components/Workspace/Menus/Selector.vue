<template>
  <section class="flex items-center gap-2" aria-label="Menu controls">
    <USelect
      v-if="items.length"
      v-model="selectedMenuId"
      :items="items"
      value-key="value"
      aria-label="Select Menu"
      class="min-w-0 flex-1 sm:max-w-72"
    />

    <UButton
      to="/workspace/kitchen/menus/create"
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Create Menu"
      :title="menuCreateBlockedMessage || 'Create Menu'"
      :disabled="!canCreateMenu"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenusWorkspace } from '../../../composables/workspace/Menus/useKitchenMenusWorkspace'

const {
  menus,
  selectedMenuId,
  canCreateMenu,
  menuCreateBlockedMessage,
} = useKitchenMenusWorkspace()
const items = computed(() =>
  menus.value.map((menu) => ({
    label: String(menu.name || menu.id || 'Untitled Menu').trim(),
    value: String(menu.id || '').trim(),
  }))
)
</script>
