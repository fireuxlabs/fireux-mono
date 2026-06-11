<template>
  <section class="space-y-2">
    <pre>ConsoleSupplierIndexLive</pre>

    <SupplierCollectionManager
      :collection="collection"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
      v-model:filter-mode="liveMode"
      :filter-options="liveModeOptions"
      :show-filter-toggle="true"
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
import { computed, ref } from 'vue'
import type { Supplier } from '../../../../models/supplier/Supplier.model'

type LiveMode = 'console' | 'mine'

const props = withDefaults(
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

const liveMode = ref<LiveMode>('console')
const liveModeOptions = [
  { value: 'console' as const, label: 'Supplier consoles' },
  { value: 'mine' as const, label: 'My suppliers' },
]
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
