<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <OrganismsProfilesEmployerCardsPill
          v-if="pill"
          :employer="pill"
          class="max-w-md"
        />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">No employer profile loaded.</p>
  </div>
</template>

<script setup lang="ts">
import type {
  EmployerProfile,
  EmployerCard,
} from '../../../../../models/profiles/Employer.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

defineProps<{
  coreProfile: EmployerProfile | null | undefined
  appProfile?: Partial<EmployerProfile> | null | undefined
  pill: EmployerCard.Pill | null
}>()

const { coreUser } = useUser()
</script>
