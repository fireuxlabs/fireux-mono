<template>
  <div>
    <component
      :is="componentForVariant"
      v-for="card in cards"
      :key="cardKey(card)"
      v-bind="card"
    />
  </div>

  <DevJsonPanel
    v-if="devMode"
    title="Dev · Chef Collection"
    :data="{ variant, count: cards.length, cards }"
  />
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import { computed } from 'vue';
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef';

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

const cardKey = (card: ChefCard.Card) => card.id || card.to || card.title
</script>
