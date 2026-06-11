<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
        <p class="console-card-header__description">
          Selected property in the console.
        </p>
      </div>
    </template>

    <div v-if="focus.hasSelection" class="space-y-4">
      <PropertyCardsPill
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
          Property ID:
          <span class="console-summary-value">{{ focus.id }}</span>
        </div>
        <div class="console-summary-field">
          Properties in Scope:
          <span class="console-summary-value">{{ groupCountLabel }}</span>
        </div>
      </div>
    </div>

    <p v-else class="console-card-header__description">
      No property is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyInterface } from '../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'
import type { Property } from '../../../models/property.model'

type PropertyPillCard = NonNullable<
  ReturnType<ReturnType<typeof usePropertyInterface>['pill']>
>

type PropertyOverviewFocusState = {
  entity: Property | null
  id: string
  mode: string
  hasSelection: boolean
}

type PropertyOverviewGroupSummary = {
  count: number
}

const props = defineProps<{
  focus: PropertyOverviewFocusState
  group: PropertyOverviewGroupSummary
}>()

const { pill } = usePropertyInterface()

const focusCard = computed<PropertyPillCard | null>(() => {
  const property = props.focus.entity
  if (!property) return null
  return pill(property) ?? null
})

const focusModeLabel = computed(() =>
  props.focus.mode === 'demo' ? 'Demo' : props.focus.mode === 'test' ? 'Test' : 'Live'
)
const groupCountLabel = computed(() => String(props.group.count))
</script>
