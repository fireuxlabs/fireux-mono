<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>App chefs</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">Chefs scoped to this tenant application.</p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesChefCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :chef="pill"
      />
    </div>

    <p v-else class="text-sm opacity-70">No tenant-scoped chefs found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  ChefProfile,
  ChefCard,
} from '../../../../../models/profiles/Chef.model.ts'
import { useChefCollection } from '../../../../../composables/firestore/profiles/Chef/main/useChefCollection.ts'
import {
  resolveChefPill,
  resolveChefPillKey,
} from '../../../../../composables/firestore/profiles/Chef/main/useChefInterface.ts'

const { localChefs } = useChefCollection()

const total = computed(() => localChefs?.value?.length ?? 0)

const pills = computed<ChefCard.Pill[]>(() =>
  (localChefs?.value ?? []).map((chef: ChefProfile) => resolveChefPill(chef))
)

const pillKey = resolveChefPillKey
</script>
