<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Kitchens</div>
        <div class="text-sm text-dimmed">{{ total }}</div>
      </div>
    </template>

    <div v-if="!cells.length" class="text-sm text-dimmed">
      No kitchens yet.
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <OrganismsObjectsKitchenCardsCell
        v-for="cell in cells"
        :key="cell.id"
        :card="cell"
        :avatar="cell.avatar ?? null"
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

const { cellProps } = useKitchenInterface()
const cells = computed(() => (kitchens.value ?? []).map((k) => cellProps(k)))
const total = computed(() => cells.value.length)
</script>
