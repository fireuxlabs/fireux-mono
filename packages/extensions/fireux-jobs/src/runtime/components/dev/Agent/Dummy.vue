<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Agent card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, cell, and preview variants.</p>
      </div>
    </template>

    <div class="space-y-4">
      <OrganismsProfilesAgentCardsPill v-bind="pill" />
      <OrganismsProfilesAgentCardsCell v-bind="cell" />
      <OrganismsProfilesAgentCardsPreview v-bind="preview" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevAgentDummy' })

import { dummyAgentCell, dummyAgentPill, dummyAgentPreview } from '../../../../../../../../dummy/agent.dummy'

const pill = dummyAgentPill
const cell = dummyAgentCell
const preview = dummyAgentPreview
</script>
