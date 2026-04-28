<template>
  <OrganismsMiseCollectionManager
    :collection="miseTasks"
    title="Mise Tasks"
    description="Browse mise tasks for the selected kitchen."
    :link="false"
  />
</template>

<script setup lang="ts">
import type { KitchenMiseTask } from '../../../../../models/kitchen-mise.model'

defineProps<{
  miseTasks: KitchenMiseTask[]
}>()
</script>
