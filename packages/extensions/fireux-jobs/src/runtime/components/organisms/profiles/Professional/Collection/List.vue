<template>
  <div
    v-if="variant === 'pill'"
    class="collection-grid collection-grid--pill"
  >
    <OrganismsProfilesProfessionalCardsPill
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      class="block"
    />
  </div>

  <div
    v-else-if="variant === 'cell'"
    class="collection-grid collection-grid--cell"
  >
    <OrganismsProfilesProfessionalCardsCell
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      class="block"
    />
  </div>

  <div
    v-else-if="variant === 'preview'"
    class="collection-grid collection-grid--pill"
  >
    <OrganismsProfilesProfessionalCardsPreview
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <div v-else class="space-y-3">
    <OrganismsProfilesProfessionalCardsProfile
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <DevJsonPanel
    v-if="devMode"
    class="mt-3"
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
