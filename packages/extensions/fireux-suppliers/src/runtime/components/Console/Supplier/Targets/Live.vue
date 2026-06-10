<template>
  <SupplierCollectionManager
    :collection="collection"
    title="Choose Supplier"
    description="Select the supplier you want to work on."
    :link="false"
    :action="true"
    :show-badges="false"
    @select="emit('select', $event)"
  />
</template>

<script setup lang="ts">
import type { Supplier } from '../../../../models/supplier/Supplier.model'

withDefaults(
  defineProps<{
    collection?: Supplier[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
