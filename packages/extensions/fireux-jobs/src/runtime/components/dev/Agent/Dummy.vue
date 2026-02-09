<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Dummy surfaces for agents</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Dummy surfaces for agents.</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <ProfilesAgentCardsPill
          v-for="(pillItem, index) in pillList"
          :key="pillItem.displayName"
          v-bind="pillItem"
          action
          @action="selectedIndex = index"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <ProfilesAgentCardsPill v-bind="current.pill" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <ProfilesAgentCardsCell v-bind="current.cell" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <ProfilesAgentCardsPreview v-bind="current.preview" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <ProfilesAgentCardsProfile :card="current.profile" />
      </div>
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
  profile: previewList[selectedIndex.value] ?? previewList[0],
}))
</script>
