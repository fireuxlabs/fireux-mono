<template>
  <section class="space-y-2">
    <pre>ConsoleSupplierIndexSelected</pre>

    <UPageCard
      v-if="supplierId"
      :title="selectedTitle"
      :description="supplierName || supplierId"
      variant="subtle"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="emit('clear')"
        >
          Clear
        </UButton>
      </template>
    </UPageCard>

    <UPageCard
      v-else
      title="No selected Supplier"
      description="Choose a live or demo Supplier target to open selected Supplier console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { SupplierSurface } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const props = defineProps<{
  supplier?: SupplierSurface | null
  supplierId?: string
  mode?: ConsoleMode
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const supplierName = computed(() =>
  String(props.supplier?.name || props.supplier?.slug || '').trim()
)
const selectedTitle = computed(() =>
  props.mode === 'demo' ? 'Selected Demo Supplier' : 'Selected Supplier'
)
</script>
