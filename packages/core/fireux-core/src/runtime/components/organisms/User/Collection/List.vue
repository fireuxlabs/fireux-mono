<template>
  <div v-if="variant === 'pill'" class="flex flex-wrap gap-2">
    <OrganismsUserCardsPill v-for="item in cards" :key="item.to" v-bind="item" />
  </div>

  <div v-else-if="variant === 'preview'" class="space-y-3">
    <OrganismsUserCardsPreview
      v-for="item in cards"
      :key="item.to"
      v-bind="item"
    />
  </div>

  <div v-else-if="variant === 'profile'" class="space-y-3">
    <OrganismsUserCardsProfile
      v-for="item in cards"
      :key="item.to"
      v-bind="item"
    />
  </div>

  <div v-else class="fx-section__grid">
    <article v-for="item in cards" :key="item.to">
      <OrganismsUserCardsCell v-bind="item" />
    </article>
  </div>

  <DevJsonPanel
    v-if="devMode"
    class="mt-3"
    title="Dev · User Collection"
    :data="{ variant, count: cards.length, cards }"
  />
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'

withDefaults(
  defineProps<{
    cards: UserCard.Card[]
    variant?: 'pill' | 'cell' | 'preview' | 'profile'
  }>(),
  {
    variant: 'pill',
  }
)

const { devMode } = useFireUXConfig()
</script>
