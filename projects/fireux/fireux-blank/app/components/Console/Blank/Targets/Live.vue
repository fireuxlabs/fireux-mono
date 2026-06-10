<template>
  <BlankCollectionManager
    :collection="collection"
    :pending="pending"
    title="Choose Blank"
    description="Select the Blank target you want to work on."
    :action="true"
    :show-badges="false"
    @select="emit('select', $event)"
  />
</template>

<script setup lang="ts">
import type { Blank } from '../../../../models/blank.model'

withDefaults(
  defineProps<{
    collection?: Blank[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
