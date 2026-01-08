<template>
  <div
    v-if="variant === 'pill'"
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    <OrganismsProfilesProfessionalCardsPill
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <div
    v-else-if="variant === 'cell'"
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    <OrganismsProfilesProfessionalCardsCell
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <div
    v-else-if="variant === 'preview'"
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

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
