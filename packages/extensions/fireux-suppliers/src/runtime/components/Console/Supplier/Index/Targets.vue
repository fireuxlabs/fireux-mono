<template>
  <section class="space-y-2">
    <pre>ConsoleSupplierIndexTargets</pre>

    <SupplierCollectionManager
      :collection="collection"
      :pending="pending"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
      title="Choose Supplier"
      description="Select the Supplier console target you want to work on."
      :link="false"
      :action="true"
      :show-badges="false"
      @select="selectSupplier"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Supplier } from '../../../../models/supplier/Supplier.model'

const props = withDefaults(
  defineProps<{
    collection?: Supplier[]
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

const consoleIds = computed(() =>
  props.collection
    .map((supplier) => String(supplier.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
function selectSupplier(id: string) {
  const supplierId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(supplierId)) return
  emit('select', supplierId)
}
</script>
