<template>
  <section class="space-y-2">
    <pre>ConsoleSupplierIndexDemo</pre>

    <SupplierCollectionManager
      :collection="collection"
      title="Demo Suppliers"
      description="Select a read-only Supplier demo target to inspect the console shape."
      :link="false"
      :action="true"
      :show-badges="true"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { SupplierSurface } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

withDefaults(
  defineProps<{
    collection?: SupplierSurface[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
