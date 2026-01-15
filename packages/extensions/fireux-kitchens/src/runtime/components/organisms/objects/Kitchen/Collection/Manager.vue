<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Kitchens</div>
        <div class="text-sm text-dimmed">{{ total }}</div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No kitchens yet.
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <OrganismsObjectsKitchenCardsCell
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
import { computed } from 'vue'
import { useKitchens } from '../../../../../composables/fireux/firestore/objects/kitchen/useKitchens'
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../../../../models/objects/kitchen.model'

const { collection } = useKitchens<Kitchen>()
const kitchens = computed(() => (collection.value ?? []) as Kitchen[])

const { card: makeCard } = useKitchenInterface()

const cards = computed(() =>
  (kitchens.value ?? [])
    .map((k) => makeCard(k))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => cards.value.length)
</script>
