<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Global chefs</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Chefs available across the FireUX network.
      </p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesChefCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :chef="pill"
      />
    </div>

    <p v-else class="text-sm opacity-70">No global chefs found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefProfile } from '../../../../../models/profiles/Chef/Chef.model.ts'
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefInterface.ts'
import { useChefCollection } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefCollection.ts'
import {
  resolveChefPill,
  resolveChefPillKey,
} from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefInterface.ts'

const { globalChefs } = useChefCollection()

const total = computed(() => globalChefs.value?.length ?? 0)

const pills = computed<ChefCard.Pill[]>(() =>
  (globalChefs.value ?? []).map((chef: ChefProfile) => resolveChefPill(chef))
)

const pillKey = resolveChefPillKey
</script>
