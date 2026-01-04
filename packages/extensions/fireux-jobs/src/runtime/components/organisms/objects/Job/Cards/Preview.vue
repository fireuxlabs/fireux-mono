<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar :src="card.avatar || undefined" :alt="card.title" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ card.title }}</div>
        <div v-if="card.subtitle" class="truncate text-sm text-dimmed">{{ card.subtitle }}</div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const props = defineProps<{ card: JobCard.Card; prop?: string }>()

const card = toRef(props, 'card')
const prop = toRef(props, 'prop')
</script>
