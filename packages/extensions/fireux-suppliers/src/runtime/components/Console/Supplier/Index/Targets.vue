<template>
  <section class="space-y-2">
    <pre>ConsoleSupplierIndexTargets</pre>

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Choose Supplier</h2>
            <p>Select the Supplier console target you want to work on.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <p v-if="pending" class="text-sm text-dimmed">Loading suppliers...</p>

      <div v-else-if="cards.length" class="space-y-3">
        <SupplierCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="false"
          action
          :show-badges="false"
          @action="selectSupplier(card.id)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No Supplier targets found.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Supplier } from '../../../../models/supplier/Supplier.model'
import { useSupplierInterface } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

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
const { cell } = useSupplierInterface()
const cards = computed(() =>
  props.collection
    .map((supplier) => cell(supplier))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)

function selectSupplier(id: string) {
  const supplierId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(supplierId)) return
  emit('select', supplierId)
}
</script>
