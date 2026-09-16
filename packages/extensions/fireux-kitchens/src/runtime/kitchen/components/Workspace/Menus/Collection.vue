<template>
  <header class="workspace-panel-header">
    <h2 class="fx-type-card-title">{{ collectionTitle }}</h2>
    <UButton
      v-if="
        derived.status !== 'loading' &&
        derived.capability.primitives.create.available
      "
      label="Create Menu"
      icon="i-lucide-plus"
      @click="actions.openCreate"
    />
  </header>
  <p v-if="derived.status === 'loading'" role="status" class="fx-type-body">
    Loading Menus…
  </p>
  <UAlert
    v-else-if="derived.status === 'error'"
    color="error"
    title="Menus could not be loaded"
  >
    <template #description
      ><MoleculesCopyError
        :message="String(error || 'Menus could not be loaded.')"
    /></template>
  </UAlert>
  <template v-else>
    <WorkspaceKitchenMenusList @select="emit('select')" />
    <p v-if="menuCreateBlockedMessage" class="fx-type-caption">
      {{ menuCreateBlockedMessage }}
    </p>
  </template>
  <WorkspaceKitchenMenusCrud />
</template>
<script setup lang="ts">
const emit = defineEmits<{ select: [] }>()
import { computed } from 'vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const {
  derived,
  error,
  actions,
  menuCreateBlockedMessage,
  availableKitchens,
  kitchenId,
} = useKitchenMenusContext()
const collectionTitle = computed(() => {
  const name = availableKitchens.value.find(
    (kitchen) => kitchen.id === kitchenId.value
  )?.display_name
  return name ? `${name}’s Menus` : 'Menus'
})
</script>
