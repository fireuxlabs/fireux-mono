<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Professional card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, cell, and preview variants.</p>
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

      <ProfilesProfessionalCardsPill v-if="current.pill" v-bind="current.pill" />
      <ProfilesProfessionalCardsCell v-if="current.cell" v-bind="current.cell" />
      <ProfilesProfessionalCardsPreview v-if="current.preview" v-bind="current.preview" />
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
}))
</script>
