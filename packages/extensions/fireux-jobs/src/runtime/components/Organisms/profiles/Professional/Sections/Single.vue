<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <OrganismsProfilesProfessionalCardsPill
          v-if="pill"
          :professional="pill"
          class="max-w-md"
        />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">No professional profile loaded.</p>
  </div>
</template>

<script setup lang="ts">
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

defineProps<{
  coreProfile: ProfessionalProfile | null | undefined
  appProfile?: Partial<ProfessionalProfile> | null | undefined
  pill: ProfessionalCard.Pill | null
}>()

const { coreUser } = useUser()
</script>
