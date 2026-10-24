<template>
  <section class="space-y-4" aria-label="Your Projects">
    <Collection
      :workspace="workspace"
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
import { useProjectWorkspace } from '../../composables/workspace/useProjectWorkspace'
import { useWorkspaceCreation } from 'fireux-core/runtime/workspace/composables/useWorkspaceCreation'
const workspace = useProjectWorkspace()
const createOpen = ref(false)
const creation = useWorkspaceCreation('project', () => ({
  count: workspace.access.ids.value.length,
  outcome: workspace.access.outcome.value,
}))
</script>
