<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="card.avatar || undefined" :alt="card.title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__title">{{ card.title }}</div>
        <div v-if="card.subtitle" class="fx-cell__subtitle">{{ card.subtitle }}</div>
        <div v-if="prop" class="fx-cell__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const props = defineProps<{ card: JobCard.Card; prop?: string }>()

const card = toRef(props, 'card')
const prop = toRef(props, 'prop')
</script>
