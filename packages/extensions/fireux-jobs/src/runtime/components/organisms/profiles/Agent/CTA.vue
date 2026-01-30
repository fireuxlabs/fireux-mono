<template>
  <UPageCTA
    class="cta"
    title="Agent profile"
    description="Create your agent profile so professionals know who to contact."
    variant="subtle"
    orientation="horizontal"
  >
    <div v-if="card()" class="cta__body space-y-4">
      <OrganismsProfilesAgentCardsPreview v-bind="card()" :link="true" />
    </div>

    <div v-else class="cta__body space-y-2">
      <OrganismsProfilesAgentCreateSystem />
    </div>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent';

const { card } = useAgent()

</script>

