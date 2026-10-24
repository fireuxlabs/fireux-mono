<template>
  <section class="space-y-4" aria-label="Your Kitchens">
    <UAlert
      v-if="adoption.error.value"
      color="error"
      :title="adoption.error.value"
    >
      <template #actions
        ><UButton
          label="Try again"
          @click="adoption.adopt()" /><MoleculesCopyError
          :message="adoption.error.value"
      /></template>
    </UAlert>
    <p v-else-if="adoption.pending.value" role="status">
      Connecting your Kitchen…
    </p>
    <WorkspaceKitchenHomeCollection
      v-else
      :index="index"
      :can-create="creation.canCreate.value"
      open-on-select
      @create="createOpen = true"
    />
    <WorkspaceKitchenHomeCreate
      v-if="creation.canCreate.value"
      v-model:open="createOpen"
    />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenWorkspaceIndex } from '../../../composables/workspace/useKitchenWorkspaceIndex'
import { useKitchenAnonymousAdoption } from '../../../composables/workspace/useKitchenAnonymousAdoption'
import { useKitchenCreationAllowance } from '../../../composables/useKitchenCreationAllowance'
const index = useKitchenWorkspaceIndex()
const createOpen = ref(false)
const creation = useKitchenCreationAllowance()
const adoption = useKitchenAnonymousAdoption()
</script>
