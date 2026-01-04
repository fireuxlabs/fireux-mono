<template>
  <div class="fx-pill">
    <UAvatar :src="card.avatar || undefined" :alt="card.title" size="xs" />
    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ card.title }}</div>
      <div v-if="card.subtitle" class="min-w-0 truncate text-xs text-dimmed">{{ card.subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const props = defineProps<{ card: JobCard.Card }>()

const card = toRef(props, 'card')
</script>
