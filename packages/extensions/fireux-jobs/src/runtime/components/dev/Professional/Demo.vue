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
        <ProfessionalCardsPill
          v-for="(pillItem, index) in pillList"
          :key="pillItem.displayName"
          v-bind="pillItem"
          action
          @action="selectedIndex = index"
        />
      </div>

      <ProfessionalCardsPill v-if="current.pill" v-bind="current.pill" />
      <ProfessionalCardsCell v-if="current.cell" v-bind="current.cell" />
      <ProfessionalCardsPreview v-if="current.preview" v-bind="current.preview" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevProfessionalDemo' })

import { computed, ref } from 'vue'
import {
  demoProfessionalCellList,
  demoProfessionalPillList,
  demoProfessionalPreviewList,
} from '../../../../../../../../demo/professional.demo'

const pillList = demoProfessionalPillList
const cellList = demoProfessionalCellList
const previewList = demoProfessionalPreviewList

const selectedIndex = ref(0)

const current = computed(() => ({
  pill: pillList[selectedIndex.value] ?? pillList[0],
  cell: cellList[selectedIndex.value] ?? cellList[0],
  preview: previewList[selectedIndex.value] ?? previewList[0],
}))
</script>
