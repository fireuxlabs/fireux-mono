<template>
  <section class="flex items-center gap-2" aria-label="Menu controls">
    <UTabs
      v-if="items.length"
      :model-value="selectedMenuId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="selectedMenuId = String($event)"
    />

    <UButton
      v-if="derived.capability.primitives.create.available"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Menu"
      :title="menuCreateBlockedMessage || 'Create Menu'"
      @click="actions.openCreate"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'

const { menus, selectedMenuId, derived, actions, menuCreateBlockedMessage } =
  useKitchenMenusContext()
const items = computed(() =>
  menus.value.map((menu) => ({
    label: String(menu.name || menu.id || 'Untitled Menu').trim(),
    value: String(menu.id || '').trim(),
  }))
)
</script>
