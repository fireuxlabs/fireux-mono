<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Dummy surfaces for professionals</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Dummy surfaces for professionals.</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <ProfilesProfessionalCardsPill
          v-for="(pillItem, index) in pillList"
          :key="pillItem.displayName"
          v-bind="pillItem"
          action
          @action="selectedIndex = index"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <ProfilesProfessionalCardsPill v-bind="current.pill" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <ProfilesProfessionalCardsCell v-bind="current.cell" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <ProfilesProfessionalCardsPreview v-bind="current.preview" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <ProfilesProfessionalCardsProfile :card="current.profile" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevProfessionalDummy' })

import { computed, ref } from 'vue'
import {
    dummyProfessionalCellList,
    dummyProfessionalPillList,
    dummyProfessionalPreviewList,
} from '../../../../../../../../dummy/professional.dummy'

const pillList = dummyProfessionalPillList
const cellList = dummyProfessionalCellList
const previewList = dummyProfessionalPreviewList

const selectedIndex = ref(0)

const current = computed(() => ({
  pill: pillList[selectedIndex.value] ?? pillList[0],
  cell: cellList[selectedIndex.value] ?? cellList[0],
  preview: previewList[selectedIndex.value] ?? previewList[0],
  profile: previewList[selectedIndex.value] ?? previewList[0],
}))
</script>
