<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
        <p class="console-card-header__description">
          Selected kitchen in the console.
        </p>
      </div>
    </template>

    <div v-if="focus.hasSelection" class="space-y-4">
      <KitchenCardsPill
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
          Kitchen ID:
          <span class="console-summary-value">{{ focus.id }}</span>
        </div>
        <div class="console-summary-field">
          Kitchens in Scope:
          <span class="console-summary-value">{{ groupCountLabel }}</span>
        </div>
      </div>
    </div>

    <p v-else class="console-card-header__description">
      No kitchen is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useKitchenInterface,
  type KitchenSurface,
} from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

type KitchenPillCard = NonNullable<
  ReturnType<ReturnType<typeof useKitchenInterface>['pill']>
>

type KitchenOverviewFocusState = {
  entity: KitchenSurface | null
  id: string
  mode: string
  hasSelection: boolean
}

type KitchenOverviewGroupSummary = {
  count: number
}

const props = defineProps<{
  focus: KitchenOverviewFocusState
  group: KitchenOverviewGroupSummary
}>()

const { pill } = useKitchenInterface()

const focusCard = computed<KitchenPillCard | null>(() => {
  const kitchen = props.focus.entity
  if (!kitchen) return null
  return pill(kitchen) ?? null
})

const focusModeLabel = computed(() =>
  props.focus.mode === 'demo' ? 'Demo' : props.focus.mode === 'test' ? 'Test' : 'Live'
)
const groupCountLabel = computed(() => String(props.group.count))
</script>
