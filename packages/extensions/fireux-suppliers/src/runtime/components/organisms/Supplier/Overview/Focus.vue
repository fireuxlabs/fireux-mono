<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
        <p class="console-card-header__description">
          Selected supplier in the console.
        </p>
      </div>
    </template>

    <div v-if="focus.hasSelection" class="space-y-4">
      <SupplierCardsPill
        v-if="focusCard"
        v-bind="focusCard"
        :link="false"
        :show-badges="false"
      />

      <div class="console-summary-grid">
        <div class="console-summary-field">
          Mode:
          <span class="console-summary-value">{{ focusModeLabel }}</span>
        </div>
        <div class="console-summary-field">
          Supplier ID:
          <span class="console-summary-value">{{ focus.id }}</span>
        </div>
        <div class="console-summary-field">
          Suppliers in Scope:
          <span class="console-summary-value">{{ groupCountLabel }}</span>
        </div>
      </div>
    </div>

    <p v-else class="console-card-header__description">
      No supplier is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

type SupplierPillCard = NonNullable<
  ReturnType<ReturnType<typeof useSupplierInterface>['pill']>
>

type SupplierOverviewFocusState = {
  entity: SupplierSurface | null
  id: string
  mode: string
  hasSelection: boolean
}

type SupplierOverviewGroupSummary = {
  count: number
}

const props = defineProps<{
  focus: SupplierOverviewFocusState
  group: SupplierOverviewGroupSummary
}>()

const { pill } = useSupplierInterface()

const focusCard = computed<SupplierPillCard | null>(() => {
  const supplier = props.focus.entity
  if (!supplier) return null
  return pill(supplier) ?? null
})

const focusModeLabel = computed(() =>
  props.focus.mode === 'demo' ? 'Demo' : props.focus.mode === 'test' ? 'Test' : 'Live'
)
const groupCountLabel = computed(() => String(props.group.count))
</script>
