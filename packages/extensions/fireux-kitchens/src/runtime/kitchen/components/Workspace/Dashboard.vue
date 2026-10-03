<template>
  <section class="space-y-4" aria-label="Your Kitchens">
    <UAlert
      v-if="creation.adoption.error.value"
      color="error"
      :title="creation.adoption.error.value"
    >
      <template #actions
        ><UButton
          label="Try again"
          @click="creation.adoption.adopt()" /><MoleculesCopyError
          :message="creation.adoption.error.value"
      /></template>
    </UAlert>
    <p v-else-if="creation.adoption.pending.value" role="status">
      Connecting your Kitchen…
    </p>
    <Collection
      v-else
      :index="index"
      :can-create="creation.canCreate.value"
      open-on-select
      @create="createOpen = true"
    />
    <Create v-if="creation.canCreate.value" v-model:open="createOpen" />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Collection from './Home/Collection.vue'
import Create from './Home/Create.vue'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/useKitchenWorkspaceIndex'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
const index = useKitchenWorkspaceIndex()
const createOpen = ref(false)
const creation = useKitchenWorkspace()
</script>
