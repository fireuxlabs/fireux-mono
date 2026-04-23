<template>
  <ConsoleKitchenChildLayout
    description="Selected kitchen and mise collection in scope."
    item-label="Mise Tasks"
    :item-count="countLabel"
    :pending="pending"
    pending-title="Loading mise tasks"
    pending-description="Fetching mise tasks for the selected kitchen."
  >
    <OrganismsMiseCollectionManager
      :collection="miseTasks"
      title="Mise Tasks"
      description="Browse mise tasks for the selected kitchen."
      :link="false"
    />
  </ConsoleKitchenChildLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../../../models/kitchen-mise.model'

const props = defineProps<{
  miseTasks: KitchenMiseTask[]
  pending: boolean
}>()

const countLabel = computed(() => String(props.miseTasks.length))
</script>
