<template>
  <div v-if="variant === 'pill'" class="flex flex-wrap gap-2">
    <OrganismsAppCardsPill v-for="item in cards" :key="item.to" v-bind="item" />
  </div>

  <div v-else-if="variant === 'preview'" class="space-y-3">
    <OrganismsAppCardsPreview
      v-for="item in cards"
      :key="item.to"
      v-bind="item"
    />
  </div>

  <div v-else-if="variant === 'profile'" class="space-y-3">
    <OrganismsAppCardsProfile
      v-for="item in cards"
      :key="item.to"
      v-bind="item"
    />
  </div>

  <div v-else class="fx-section__grid">
    <article v-for="item in cards" :key="item.to">
      <OrganismsAppCardsCell v-bind="item" />
    </article>
  </div>

  <DevJsonPanel
    v-if="devMode"
    class="mt-3"
    title="Dev · App Collection"
    :data="{ variant, count: cards.length, cards }"
  />
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'

withDefaults(
  defineProps<{
    cards: AppCard.Card[]
    variant?: 'pill' | 'cell' | 'preview' | 'profile'
  }>(),
  {
    variant: 'pill',
  }
)

const { devMode } = useFireUXConfig()
</script>
