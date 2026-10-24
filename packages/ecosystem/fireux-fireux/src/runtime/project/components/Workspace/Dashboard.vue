<template>
  <section class="space-y-4" aria-label="Your Projects">
    <Collection
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
import { useProjectWorkspaceIndex } from '../../composables/workspace/useProjectWorkspaceIndex'
import { useWorkspaceCreation } from 'fireux-core/runtime/workspace/composables/useWorkspaceCreation'
const index = useProjectWorkspaceIndex()
const createOpen = ref(false)
const creation = useWorkspaceCreation('project', () => ({
  count: index.access.ids.value.length,
  outcome: index.access.outcome.value,
}))
</script>
