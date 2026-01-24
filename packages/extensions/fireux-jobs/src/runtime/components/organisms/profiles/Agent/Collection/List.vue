<template>
  <div v-if="variant === 'pill'" class="collection-grid">
    <OrganismsProfilesAgentCardsPill
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      
    />
  </div>

  <div v-else-if="variant === 'cell'" class="collection-stack">
    <OrganismsProfilesAgentCardsCell
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      
    />
  </div>

  <div v-else-if="variant === 'preview'" class="collection-stack">
    <OrganismsProfilesAgentCardsPreview
      v-for="item in cards"
      :key="item.to"
      :card="item"
    />
  </div>

  <div v-else class="collection-stack">
    <OrganismsProfilesAgentCardsProfile v-for="item in cards" :key="item.to" :card="item" />
  </div>

  <DevJsonPanel
    v-if="devMode"
    title="Dev · Agent Collection"
    :data="{ variant, count: cards.length, cards }"
  />
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent';

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
