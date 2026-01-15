<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Companies</div>
        <div class="text-sm text-dimmed">{{ total }}</div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No companies yet.
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <OrganismsObjectsCompanyCardsCell
        v-for="card in cards"
        :key="card.id"
        :to="card.to"
        :name="card.name"
        :website="card.website"
        :badges="card.badges"
        :avatar-url="card.avatarUrl"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CompanyCard } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface';

const props = defineProps<{ cards: CompanyCard.Card[]; total?: number }>()

const cards = computed(() => props.cards ?? [])
const total = computed(() => props.total ?? cards.value.length)
</script>
