<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Jobs</div>
        <div class="text-sm text-dimmed">{{ total }}</div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">No jobs yet.</div>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <OrganismsObjectsJobCardsCell
        v-for="card in cards"
        :key="card.id"
        v-bind="card"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface';

const props = defineProps<{ cards: JobCard.Card[]; total?: number }>()

const cards = computed(() => props.cards ?? [])
const total = computed(() => props.total ?? cards.value.length)
</script>

