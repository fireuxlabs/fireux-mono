<template>
  <div v-if="variant === 'pill'">
    <OrganismsProfilesProfessionalCardsPill
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      
    />
  </div>

  <div v-else-if="variant === 'cell'">
    <OrganismsProfilesProfessionalCardsCell
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      
    />
  </div>

  <div v-else-if="variant === 'preview'">
    <OrganismsProfilesProfessionalCardsPreview
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <div v-else>
    <OrganismsProfilesProfessionalCardsProfile
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <DevJsonPanel
    v-if="devMode"
    title="Dev · Professional Collection"
    :data="{ variant, count: cards.length, cards }"
  />
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional';

withDefaults(
  defineProps<{
    cards: ProfessionalCard.Card[]
    variant?: 'pill' | 'cell' | 'preview' | 'profile'
  }>(),
  {
    variant: 'pill',
  }
)

const { devMode } = useFireUXConfig()

</script>
