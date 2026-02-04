<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Professional card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, cell, and preview variants.</p>
      </div>
    </template>

    <div class="space-y-4">
      <OrganismsProfilesProfessionalCardsPill v-bind="pill" />
      <OrganismsProfilesProfessionalCardsCell v-bind="cell" />
      <OrganismsProfilesProfessionalCardsPreview v-bind="preview" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevProfessionalDummy' })

import {
  dummyProfessionalCell,
  dummyProfessionalPill,
  dummyProfessionalPreview,
} from '../../../../../../../../dummy/professional.dummy'
const pill = dummyProfessionalPill
const cell = dummyProfessionalCell
const preview = dummyProfessionalPreview
</script>
