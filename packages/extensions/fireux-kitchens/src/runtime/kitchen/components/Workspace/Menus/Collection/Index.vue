<template>
  <WorkspaceKitchenCollectionHeader title="Menus">
    <template #actions>
      <UButton
        v-if="
          derived.status !== 'loading' &&
          derived.capability.primitives.create.available
        "
        label="Create Menu"
        icon="i-lucide-plus"
        @click="actions.openCreate"
      />
    </template>
  </WorkspaceKitchenCollectionHeader>
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
    <WorkspaceKitchenMenusCollectionList />
    <WorkspaceKitchenMenusCollectionSuggestions class="mt-6" />
    <p v-if="menuCreateBlockedMessage" class="fx-type-caption">
      {{ menuCreateBlockedMessage }}
    </p>
  </template>
  <WorkspaceKitchenMenusCreateDialog />
  <WorkspaceKitchenMenusCollectionDialog />
</template>
<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useKitchenMenusContext } from '../../../../composables/workspace/menus/useKitchenMenusContext'
const {
  derived,
  error,
  actions,
  menuCreateBlockedMessage,
} = useKitchenMenusContext()
const route = useRoute()
const router = useRouter()
watch(() => [route.query.create, derived.value.capability.primitives.create.available], () => {
  if (route.query.create === '1' && derived.value.capability.primitives.create.available) {
    actions.openCreate()
    void router.replace({ query: { ...route.query, create: undefined } })
  }
}, { immediate: true })
</script>
