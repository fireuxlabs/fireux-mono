<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Global employers</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Employers available across the FireUX network.
      </p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesEmployerCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :employer="pill"
      />
    </div>

    <p v-else class="text-sm opacity-70">No global employers found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  EmployerProfile,
  EmployerCard,
} from '../../../../../models/profiles/Employer.model.ts'
import { useEmployerCollection } from '../../../../../composables/firestore/profiles/Employer/main/useEmployerCollection.ts'
import {
  resolveEmployerPill,
  resolveEmployerPillKey,
} from '../../../../../composables/firestore/profiles/Employer/main/useEmployerInterface.ts'

const { globalEmployers } = useEmployerCollection()

const total = computed(() => globalEmployers.value?.length ?? 0)

const pills = computed<EmployerCard.Pill[]>(() =>
  (globalEmployers.value ?? []).map((employer: EmployerProfile) =>
    resolveEmployerPill(employer)
  )
)

const pillKey = resolveEmployerPillKey
</script>
