<template>
  <section class="space-y-4" aria-label="Your Kitchens">
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
import Collection from './Landing/Collection.vue'
import Create from './Crud/Create.vue'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
const index = useKitchenWorkspaceIndex()
const createOpen = ref(false)
const creation = useKitchenWorkspace()
</script>
