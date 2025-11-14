<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional-profile.vue -->
<template>
  <div class="space-y-6">
    <UPageCard v-if="hasCoreProfile">
      <div class="space-y-6">
        <OrganismsProfilesProfessionalEditCore
          :professional="coreProfessional"
        />
        <OrganismsProfilesProfessionalEditApp :professional="appProfessional" />
      </div>
    </UPageCard>

    <UCard v-else>
      <p class="fallback">Professional profile not found.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import type { ProfessionalProfile } from '../../models/profiles/Professional.model.ts'

declare function definePageMeta(meta: any): void

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: 'Professional Profile',
    icon: 'i-lucide-user-round-cog',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useProfessional()

const coreProfessional = computed<ProfessionalProfile | null>(
  () => (coreProfile.value as ProfessionalProfile | null | undefined) ?? null
)

const appProfessional = computed<ProfessionalProfile | null>(
  () => (appProfile.value as ProfessionalProfile | null | undefined) ?? null
)

const hasCoreProfile = computed(() => Boolean(coreProfessional.value))
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}
</style>
