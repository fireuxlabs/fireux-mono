<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>App professionals</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Professionals scoped to this tenant application.
      </p>
    </template>

    <div v-if="cards.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesProfessionalCardsPill
        v-for="card in cards"
        :key="cardKey(card)"
        :professional="card"
      />
    </div>

    <p v-else class="text-sm opacity-70">
      No tenant-scoped professionals found.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model.ts'
import type { ProfessionalCard } from '../../../../../types/profiles/ProfessionalCard'
import { useProfessionalCollection } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import { useProfessional } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'

const { localProfessionals } = useProfessionalCollection()
const { card } = useProfessional()

const total = computed(() => localProfessionals?.value?.length ?? 0)

const cards = computed<ProfessionalCard.Card[]>(() =>
  (localProfessionals?.value ?? []).map((prof: ProfessionalCore) => card(prof))
)

const cardKey = (payload: ProfessionalCard.Card) => payload.id || payload.to || payload.title
</script>
