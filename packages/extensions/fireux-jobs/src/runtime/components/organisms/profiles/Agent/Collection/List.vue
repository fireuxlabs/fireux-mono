<template>
  <div
    v-if="variant === 'pill'"
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    <OrganismsProfilesAgentCardsPill v-for="item in cards" :key="item.to" v-bind="item" />
  </div>

  <div
    v-else-if="variant === 'cell'"
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    <OrganismsProfilesAgentCardsCell v-for="item in cards" :key="item.to" v-bind="item" />
  </div>

  <div
    v-else-if="variant === 'preview'"
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    <OrganismsProfilesAgentCardsPreview
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <div v-else class="space-y-3">
    <OrganismsProfilesAgentCardsProfile v-for="item in cards" :key="item.to" :card="item" />
  </div>

  <DevJsonPanel
    v-if="devMode"
    class="mt-3"
    title="Dev · Agent Collection"
    :data="{ variant, count: cards.length, cards }"
  />
</template>

<script setup lang="ts">
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

withDefaults(
  defineProps<{
    cards: AgentCard.Card[]
    variant?: 'pill' | 'cell' | 'preview' | 'profile'
  }>(),
  {
    variant: 'pill',
  }
)

const { devMode } = useFireUXConfig()
</script>
