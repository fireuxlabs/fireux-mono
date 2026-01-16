<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Jobs</div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ total }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">No jobs yet.</div>

    <div v-else>
      <div
        v-if="variant === 'pill'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <component
          :is="wrapperFor(card)"
          v-for="card in cards"
          :key="card.id"
          v-bind="wrapperPropsFor(card)"
          class="block"
        >
          <JobCardsPill v-bind="card" />
        </component>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <component
          :is="wrapperFor(card)"
          v-for="card in cards"
          :key="card.id"
          v-bind="wrapperPropsFor(card)"
          class="block"
        >
          <JobCardsCell v-bind="card" />
        </component>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface';

const props = defineProps<{ cards: JobCard.Card[]; total?: number }>()

const cards = computed(() => props.cards ?? [])
const total = computed(() => props.total ?? cards.value.length)

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const wrapperFor = (card: JobCard.Card) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: JobCard.Card) => (card.to ? { to: card.to } : {})
</script>

