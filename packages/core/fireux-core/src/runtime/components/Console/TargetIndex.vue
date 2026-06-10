<template>
  <section class="space-y-4">
    <UPageCard
      v-if="pending"
      :title="loadingTitleResolved"
      :description="loadingDescriptionResolved"
      variant="subtle"
    />

    <UPageCard
      v-else-if="!cards.length"
      :title="emptyTitleResolved"
      :description="emptyDescriptionResolved"
      variant="subtle"
    >
      <template v-if="createTo" #footer>
        <UButton :to="createTo" icon="i-lucide-plus" color="primary">
          {{ createLabelResolved }}
        </UButton>
      </template>
    </UPageCard>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <ConsoleEntityIndexCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :action="Boolean(card.to)"
        :show-badges="showBadges"
        @action="select(card)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import ConsoleEntityIndexCard from './EntityIndexCard.vue'
import type { ConsoleEntityIndexCard as ConsoleEntityIndexCardType } from './types'

const props = withDefaults(
  defineProps<{
    entityLabel: string
    cards?: ConsoleEntityIndexCardType[]
    pending?: boolean
    createTo?: string
    createLabel?: string
    loadingTitle?: string
    loadingDescription?: string
    emptyTitle?: string
    emptyDescription?: string
    showBadges?: boolean
  }>(),
  {
    cards: () => [],
    pending: false,
    createTo: '',
    createLabel: '',
    loadingTitle: '',
    loadingDescription: '',
    emptyTitle: '',
    emptyDescription: '',
    showBadges: true,
  }
)

const entityLower = computed(() => props.entityLabel.toLowerCase())
const loadingTitleResolved = computed(
  () => props.loadingTitle || `Loading ${props.entityLabel} targets`
)
const loadingDescriptionResolved = computed(
  () =>
    props.loadingDescription ||
    `Checking live ${entityLower.value} targets for this console.`
)
const emptyTitleResolved = computed(
  () => props.emptyTitle || `No live ${props.entityLabel} targets`
)
const emptyDescriptionResolved = computed(
  () =>
    props.emptyDescription ||
    `Create the first ${entityLower.value} target to start using this console.`
)
const createLabelResolved = computed(
  () => props.createLabel || `Create ${props.entityLabel}`
)

function select(card: ConsoleEntityIndexCardType) {
  if (!card.to) return
  navigateTo(card.to)
}
</script>
