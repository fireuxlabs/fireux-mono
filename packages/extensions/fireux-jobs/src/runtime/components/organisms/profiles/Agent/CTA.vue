<template>
  <UPageCTA
    class="cta"
    title="Agent profile"
    description="Add an agent profile to your FireUX portfolio so talent knows who is hiring."
    variant="subtle"
    orientation="horizontal"
  >
    <template #default>
      <div v-if="card()" class="cta__body space-y-4">
        <OrganismsProfilesAgentCardsPreview v-bind="card()" />
      </div>

      <div v-else class="cta__body space-y-2">
        <OrganismsProfilesAgentCreateSystem />
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts';

const { card } = useAgent()

</script>

