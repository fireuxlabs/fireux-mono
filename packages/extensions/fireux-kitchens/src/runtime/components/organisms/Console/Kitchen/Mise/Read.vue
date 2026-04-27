<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading mise tasks"
    description="Fetching mise tasks for the selected kitchen."
  />

  <OrganismsMiseCollectionManager
    v-else
    :collection="miseTasks"
    title="Mise Tasks"
    description="Browse mise tasks for the selected kitchen."
    :link="false"
  />
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
