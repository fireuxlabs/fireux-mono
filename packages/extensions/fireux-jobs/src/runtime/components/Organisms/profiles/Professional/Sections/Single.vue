<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <OrganismsProfilesProfessionalCardsCell
          v-if="cell"
          :professional="cell"
          class="max-w-xl"
        />
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
import { computed } from 'vue'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const props = defineProps<{
  coreProfile: ProfessionalProfile | null | undefined
  appProfile?: Partial<ProfessionalProfile> | null | undefined
  pill: ProfessionalCard.Pill | null
}>()

const { coreUser } = useUser()

const cell = computed<ProfessionalCard.Cell | null>(() => {
  const profile = props.coreProfile ?? null
  if (!profile) return null

  const tagline =
    profile.tagline ?? (profile as { subtitle?: string | null })?.subtitle ?? ''

  return {
    id: profile.id ?? profile.user?.id ?? 'professional-profile',
    avatar: profile.user?.avatar ?? undefined,
    title: profile.user?.display_name ?? profile.title ?? 'Professional',
    subtitle: tagline,
    tagline,
    badges: profile.badges ?? [],
    bio_short: profile.bio_short ?? null,
    specialties: profile.specialties ?? [],
    locations: profile.locations ?? [],
    to: profile.id ? `/professionals/${profile.id}` : undefined,
  }
})
</script>
