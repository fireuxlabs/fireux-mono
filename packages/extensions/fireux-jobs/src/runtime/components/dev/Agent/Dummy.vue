<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Agent card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, cell, and preview variants.</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(pillItem, index) in pillList"
          :key="pillItem.displayName"
          type="button"
          class="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary"
          @click="selectedIndex = index"
        >
          <OrganismsProfilesAgentCardsPill v-bind="pillItem" />
        </button>
      </div>

      <OrganismsProfilesAgentCardsPill v-bind="current.pill" />
      <OrganismsProfilesAgentCardsCell v-bind="current.cell" />
      <OrganismsProfilesAgentCardsPreview v-bind="current.preview" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevAgentDummy' })

import { computed, ref } from 'vue'
import {
  dummyAgentCellList,
  dummyAgentPillList,
  dummyAgentPreviewList,
} from '../../../../../../../../dummy/agent.dummy'

const pillList = dummyAgentPillList
const cellList = dummyAgentCellList
const previewList = dummyAgentPreviewList

const selectedIndex = ref(0)

const current = computed(() => ({
  pill: pillList[selectedIndex.value] ?? pillList[0],
  cell: cellList[selectedIndex.value] ?? cellList[0],
  preview: previewList[selectedIndex.value] ?? previewList[0],
}))
</script>
