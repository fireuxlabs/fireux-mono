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
    <OrganismsProfilesAgentCardsProfile v-for="item in cards" :key="item.to" v-bind="item" />
  </div>
</template>

<script setup lang="ts">
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

withDefaults(
  defineProps<{
    cards: AgentCard.Card[]
    variant?: 'pill' | 'cell' | 'preview' | 'profile'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
