<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">All</div>
        <p class="console-card-header__description">
          Properties available in the selected console source.
        </p>
      </div>
    </template>

    <div class="console-focus">
      <div class="console-focus__title">
        All Properties
      </div>

      <div class="console-metric">
        <div class="console-metric__value">
          {{ groupCountLabel }}
        </div>
        <div class="console-metric__label">Properties</div>
      </div>

      <p class="console-card-header__description">
        {{ groupDescription }}
      </p>
    </div>

    <div v-if="groupCards.length" class="mt-4 space-y-2">
      <PropertyCardsPill
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
import { usePropertyInterface } from '../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'
import type { Property } from '../../../models/property.model'

type PropertyPillCard = NonNullable<
  ReturnType<ReturnType<typeof usePropertyInterface>['pill']>
>

type PropertyOverviewGroupState = {
  items: Property[]
  count: number
  hasItems: boolean
}

const props = defineProps<{
  group: PropertyOverviewGroupState
  mode: string
}>()

const { pill } = usePropertyInterface()

const groupCards = computed<PropertyPillCard[]>(() =>
  props.group.items
    .map((property) => pill(property))
    .filter((card): card is PropertyPillCard => Boolean(card))
)

const groupCountLabel = computed(() => String(props.group.count))
const groupDescription = computed(() =>
  props.mode === 'demo'
    ? 'Demo properties available in the current console scope.'
    : props.mode === 'test'
      ? 'Your personal test property available in this console.'
      : 'Live properties available in your current workspace scope.'
)
const emptyGroupDescription = computed(() =>
  props.mode === 'demo'
    ? 'No demo properties are currently in scope.'
    : props.mode === 'test'
      ? 'No test property is currently in scope.'
      : 'No live properties are currently in scope.'
)
</script>
