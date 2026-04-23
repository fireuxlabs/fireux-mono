<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">All</div>
        <p class="console-card-header__description">
          Suppliers available in the selected console source.
        </p>
      </div>
    </template>

    <div class="console-focus">
      <div class="console-focus__title">
        All Suppliers
      </div>

      <div class="console-metric">
        <div class="console-metric__value">
          {{ groupCountLabel }}
        </div>
        <div class="console-metric__label">Suppliers</div>
      </div>

      <p class="console-card-header__description">
        {{ groupDescription }}
      </p>
    </div>

    <div v-if="groupCards.length" class="mt-4 space-y-2">
      <SupplierCardsPill
        v-for="card in groupCards"
        :key="card.id"
        v-bind="card"
        :link="false"
        :show-badges="false"
      />
    </div>

    <p v-else class="mt-4 console-card-header__description">
      {{ emptyGroupDescription }}
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

type SupplierOverviewGroupState = {
  items: SupplierSurface[]
  count: number
  hasItems: boolean
}

const props = defineProps<{
  group: SupplierOverviewGroupState
  mode: string
}>()

const { pill } = useSupplierInterface()

const groupCards = computed<SupplierPillCard[]>(() =>
  props.group.items
    .map((supplier) => pill(supplier))
    .filter((card): card is SupplierPillCard => Boolean(card))
)

const groupCountLabel = computed(() => String(props.group.count))
const groupDescription = computed(() =>
  props.mode === 'demo'
    ? 'Demo suppliers available in the current console scope.'
    : props.mode === 'test'
      ? 'Your personal test supplier available in this console.'
      : 'Live suppliers available in your current workspace scope.'
)
const emptyGroupDescription = computed(() =>
  props.mode === 'demo'
    ? 'No demo suppliers are currently in scope.'
    : props.mode === 'test'
      ? 'No test supplier is currently in scope.'
      : 'No live suppliers are currently in scope.'
)
</script>
