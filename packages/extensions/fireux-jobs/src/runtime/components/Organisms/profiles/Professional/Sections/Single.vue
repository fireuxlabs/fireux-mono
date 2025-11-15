<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreProfile.display_name || 'Professional' }}</h2>
      </template>

      <div class="space-y-4">
        <OrganismsProfilesProfessionalCardsPill
          v-if="pill"
          :professional="pill"
          class="max-w-md"
        />

        <pre>{{ pill }}</pre>
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

defineProps<{
  coreProfile: ProfessionalProfile | null | undefined
  appProfile?: Partial<ProfessionalProfile> | null | undefined
  pill: ProfessionalCard.Pill | null
}>()
</script>
