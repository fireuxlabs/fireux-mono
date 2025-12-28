<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Sections/GlobalCollection.vue -->
<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Global professionals</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Professionals available globally in this FireUX environment.
      </p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesProfessionalCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :professional="pill"
      />
    </div>

    <p v-else class="text-sm opacity-70">No global professionals found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional/Professional.model.ts'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import { useProfessionalCollection } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import {
  resolveProfessionalPill,
  resolveProfessionalPillKey,
} from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface.ts'

const { globalProfessionals } = useProfessionalCollection()
const total = computed(() => globalProfessionals.value?.length ?? 0)

const pills = computed<ProfessionalCard.ProfessionalPill[]>(() =>
  (globalProfessionals.value ?? []).map((prof: ProfessionalProfile) =>
    resolveProfessionalPill(prof)
  )
)

const pillKey = resolveProfessionalPillKey
</script>
