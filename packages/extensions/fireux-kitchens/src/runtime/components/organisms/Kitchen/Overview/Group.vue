<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">All</div>
        <p class="console-card-header__description">
          Kitchens available in the selected console source.
        </p>
      </div>
    </template>

    <div class="console-focus">
      <div class="console-focus__title">
        All Kitchens
      </div>

      <div class="console-metric">
        <div class="console-metric__value">
          {{ groupCountLabel }}
        </div>
        <div class="console-metric__label">Kitchens</div>
      </div>

      <p class="console-card-header__description">
        {{ groupDescription }}
      </p>
    </div>

    <div v-if="groupCards.length" class="mt-4 space-y-2">
      <OrganismsKitchenCardsPill
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
  useKitchenInterface,
  type KitchenSurface,
} from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

type KitchenPillCard = NonNullable<
  ReturnType<ReturnType<typeof useKitchenInterface>['pill']>
>

type KitchenOverviewGroupState = {
  items: KitchenSurface[]
  count: number
  hasItems: boolean
}

const props = defineProps<{
  group: KitchenOverviewGroupState
  mode: string
}>()

const { pill } = useKitchenInterface()

const groupCards = computed<KitchenPillCard[]>(() =>
  props.group.items
    .map((kitchen) => pill(kitchen))
    .filter((card): card is KitchenPillCard => Boolean(card))
)

const groupCountLabel = computed(() => String(props.group.count))
const groupDescription = computed(() =>
  props.mode === 'demo'
    ? 'Demo kitchens available in the current console scope.'
    : props.mode === 'test'
      ? 'Your personal test kitchen available in this console.'
      : 'Live kitchens available in your current workspace scope.'
)
const emptyGroupDescription = computed(() =>
  props.mode === 'demo'
    ? 'No demo kitchens are currently in scope.'
    : props.mode === 'test'
      ? 'No test kitchen is currently in scope.'
      : 'No live kitchens are currently in scope.'
)
</script>
