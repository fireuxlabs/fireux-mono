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

          <UBadge v-if="isSettled" variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <MoleculesStateCard
        v-if="resolvedOutcome === 'pending'"
        entity="supplier targets"
        state="loading"
        surface="bare"
      />

      <MoleculesStateCard
        v-else-if="resolvedOutcome === 'error'"
        entity="supplier targets"
        state="error"
        surface="bare"
        description="Supplier targets could not be loaded. Please try again."
      />

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

      <MoleculesStateCard
        v-else-if="isSettled"
        entity="supplier targets"
        state="empty"
        surface="bare"
        title="No Supplier targets found"
        description="Suppliers you can access will appear here."
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const props = withDefaults(
  defineProps<{
    // Console target lists consume Supplier interface surfaces; storage completeness belongs in the Firestore stack.
    collection?: SupplierSurface[]
    pending?: boolean
    outcome?: ConsoleTargetOutcome
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
const resolvedOutcome = computed<ConsoleTargetOutcome>(() => {
  if (props.outcome) return props.outcome
  if (props.pending) return 'pending'
  return cards.value.length ? 'ready' : 'empty'
})
const isSettled = computed(() =>
  resolvedOutcome.value === 'ready' || resolvedOutcome.value === 'empty'
)

function selectSupplier(id: string) {
  const supplierId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(supplierId)) return
  emit('select', supplierId)
}
</script>
