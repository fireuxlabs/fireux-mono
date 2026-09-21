<template>
  <UBreadcrumb
    :ui="{ list: 'flex-wrap' }"
    :items="[
      { label: kitchenName, to: workspaceEntryPath },
      { label: 'Menus' },
    ]"
  />
  <header class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
      Menus
    </h1>
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
    <WorkspaceKitchenMenusList />
    <p v-if="menuCreateBlockedMessage" class="fx-type-caption">
      {{ menuCreateBlockedMessage }}
    </p>
  </template>
  <WorkspaceKitchenMenusCrud />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const {
  derived,
  error,
  actions,
  menuCreateBlockedMessage,
  availableKitchens,
  kitchenId,
} = useKitchenMenusContext()
const kitchenName = computed(() => {
  const name = availableKitchens.value.find(
    (kitchen) => kitchen.id === kitchenId.value
  )?.display_name
  return name || 'Kitchen'
})
</script>
