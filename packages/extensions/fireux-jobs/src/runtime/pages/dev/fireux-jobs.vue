<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Current Professional -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Professional</h1>
        </template>

        <template v-if="professionalPill">
          <OrganismsProfilesProfessionalCardsPill
            :professional="professionalPill"
          />
        </template>
        <MoleculesNotFound v-else kind="document" entity="professional" />

        <template #footer>
          <DevJsonPanel v-if="professional" :data="professional" />
        </template>
      </UCard>

      <!-- Current Employer -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Employer</h1>
        </template>

        <template v-if="employerPill">
          <OrganismsProfilesEmployerCardsPill :employer="employerPill" />
        </template>
        <MoleculesNotFound v-else kind="document" entity="employer" />

        <template #footer>
          <DevJsonPanel v-if="employer" :data="employer" />
        </template>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void

import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile'
import {
  professionalConfig,
  type ProfessionalProfile,
  type ProfessionalCard,
} from '../../models/profiles/Professional.model'
import {
  employerConfig,
  type EmployerProfile,
  type EmployerCard,
} from '../../models/profiles/Employer.model'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-jobs'],
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const { profile: professional } =
  useProfile<ProfessionalProfile>(professionalConfig)
const { profile: employer } = useProfile<EmployerProfile>(employerConfig)

const professionalPill = computed<ProfessionalCard.Pill | null>(() => {
  const value = professional.value
  if (!value) return null

  const title = (value.title || value.display_name || '').trim()
  const normalizedTitle = title || 'Professional'
  const subtitle = value.subtitle || ''
  const avatar = value.avatar_url || value.avatar || undefined
  const badges = Array.isArray(value.badges) ? value.badges : []
  const to = value.id ? `/professionals/${value.id}` : null
  const initials = normalizedTitle.charAt(0).toUpperCase() || 'P'

  return {
    avatar: avatar ?? '',
    initials,
    title: normalizedTitle,
    subtitle,
    badges,
    to,
  }
})

const employerPill = computed<EmployerCard.Pill | null>(() => {
  const value = employer.value
  if (!value) return null

  const title = (value.title || value.organization_name || '').trim()
  const normalizedTitle = title || 'Employer'
  const subtitle = value.subtitle || ''
  const avatar = value.avatar_url || value.avatar || undefined
  const badges = Array.isArray(value.badges) ? value.badges : []
  const to = value.id ? `/employers/${value.id}` : null
  const initials = normalizedTitle.charAt(0).toUpperCase() || 'E'

  return {
    avatar: avatar ?? '',
    initials,
    title: normalizedTitle,
    subtitle,
    badges,
    to,
  }
})
</script>
