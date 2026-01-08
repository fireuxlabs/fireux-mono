<template>
  <div :class="gridClass">
    <component
      :is="componentForVariant"
      v-for="card in cards"
      :key="cardKey(card)"
      :card="card"
    />
  </div>

  <DevJsonPanel
    v-if="devMode"
    class="mt-3"
    title="Dev · Chef Collection"
    :data="{ variant, count: cards.length, cards }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef'

type Variant = 'pill' | 'cell' | 'preview' | 'profile'

const props = withDefaults(
  defineProps<{
    cards: ChefCard.Card[]
    variant?: Variant
  }>(),
  {
    variant: 'pill',
  }
)

const { devMode } = useFireUXConfig()

const componentForVariant = computed(() => {
  if (props.variant === 'cell') return resolveComponent('OrganismsProfilesChefCardsCell')
  if (props.variant === 'preview') return resolveComponent('OrganismsProfilesChefCardsPreview')
  if (props.variant === 'profile') return resolveComponent('OrganismsProfilesChefCardsProfile')
  return resolveComponent('OrganismsProfilesChefCardsPill')
})

const gridClass = computed(() => {
  if (props.variant === 'pill') return 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
  return 'grid gap-4 md:grid-cols-2'
})

const cardKey = (card: ChefCard.Card) => card.id || card.to || card.title
</script>
