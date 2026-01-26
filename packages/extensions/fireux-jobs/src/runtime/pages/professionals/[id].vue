<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="canEdit"
          icon="i-lucide-pencil"
          size="xs"
          color="primary"
          variant="solid"
          @click="navigateTo('/dashboard/professional/profile')"
        >
          Edit Profile
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody space-y-6">
      <div v-if="pending" class="py-10 text-sm opacity-70">Loading profile…</div>

      <div v-else-if="!professionalProfile" class="space-y-2">
        <h1 class="text-lg font-semibold">Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/professionals" class="text-primary hover:underline">← Back</NuxtLink>
      </div>

      <div v-else class="space-y-6">
        <UCard class="overflow-hidden">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
            <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="xl" />
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-2xl font-semibold text-gray-900">
                  {{ displayName || 'Professional' }}
                </h1>
                <UBadge size="xs" variant="soft">Professional</UBadge>
              </div>
              <p class="text-sm text-gray-600">
                {{ headline || 'Profile details and availability.' }}
              </p>
              <div v-if="tags.length" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in tags"
                  :key="tag"
                  size="xs"
                  variant="soft"
                  color="primary"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div class="space-y-6">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold">About</h3>
                </div>
              </template>
              <div class="space-y-3 text-sm text-gray-700">
                <p v-if="bioShort">{{ bioShort }}</p>
                <p v-if="bioLong" class="whitespace-pre-line">{{ bioLong }}</p>
                <p v-if="!bioShort && !bioLong" class="text-gray-500">
                  No bio provided yet.
                </p>
              </div>
            </UCard>

            <UCard v-if="relevantExperience.length || otherExperience.length">
              <template #header>
                <h3 class="font-semibold">Experience</h3>
              </template>
              <div class="space-y-4">
                <div v-for="item in relevantExperience" :key="`relevant-${item.place_id}-${item.role}`">
                  <div class="text-sm font-semibold text-gray-900">{{ item.role }}</div>
                  <div class="text-xs text-gray-500">
                    {{ formatExperienceDates(item) }} · {{ item.place_id }}
                  </div>
                  <p class="text-sm text-gray-700 whitespace-pre-line">{{ item.responsibilities }}</p>
                </div>
                <div v-for="item in otherExperience" :key="`other-${item.place_id}-${item.role}`">
                  <div class="text-sm font-semibold text-gray-900">{{ item.role }}</div>
                  <div class="text-xs text-gray-500">
                    {{ formatExperienceDates(item) }} · {{ item.name || item.short_address || 'External venue' }}
                  </div>
                  <p class="text-sm text-gray-700 whitespace-pre-line">{{ item.responsibilities }}</p>
                </div>
              </div>
            </UCard>
          </div>

          <div class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="font-semibold">Specialties</h3>
              </template>
              <div v-if="specialties.length" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="specialty in specialties"
                  :key="specialty"
                  size="xs"
                  variant="soft"
                  color="neutral"
                >
                  {{ specialty }}
                </UBadge>
              </div>
              <p v-else class="text-sm text-gray-500">No specialties listed.</p>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Locations</h3>
              </template>
              <div v-if="locations.length" class="space-y-2">
                <div
                  v-for="location in locations"
                  :key="location"
                  class="text-sm text-gray-700"
                >
                  {{ location }}
                </div>
              </div>
              <p v-else class="text-sm text-gray-500">No locations listed.</p>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Certifications</h3>
              </template>
              <div v-if="certifications.length" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="cert in certifications"
                  :key="cert"
                  size="xs"
                  variant="soft"
                  color="secondary"
                >
                  {{ cert }}
                </UBadge>
              </div>
              <p v-else class="text-sm text-gray-500">No certifications listed.</p>
            </UCard>
          </div>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { computed } from 'vue'
import type { ProfessionalProfile } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { useProfessionalInterface } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import { professionalConfig } from '../../models/profiles/Professional/Professional.model.ts'

const route = useRoute()
const professionalId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  return String(raw ?? '').trim() || null
})

const { profile, pending } = useProfileFetch<ProfessionalProfile>(
  professionalId,
  professionalConfig
)

const professionalProfile = computed(() => profile.coreProfile.value ?? null)

const { appUser } = useUserFetch(professionalId)
const { user } = useUserFetch(professionalId)

const { card } = useProfessionalInterface(profile, user)
const professionalCard = computed(() =>
  professionalProfile.value ? card(professionalProfile.value, user.value) : null
)

const displayName = computed(() => user.value?.display_name ?? '')
const avatarUrl = computed(() => user.value?.avatar ?? '')
const headline = computed(
  () =>
    professionalProfile.value?.tagline ||
    professionalProfile.value?.title ||
    professionalProfile.value?.subtitle ||
    ''
)
const tags = computed(() => professionalProfile.value?.tags ?? [])
const specialties = computed(() => professionalProfile.value?.specialties ?? [])
const locations = computed(() => professionalProfile.value?.locations ?? [])
const certifications = computed(
  () => professionalProfile.value?.health_certifications ?? []
)
const bioShort = computed(() => professionalProfile.value?.bio_short ?? '')
const bioLong = computed(() => professionalProfile.value?.bio_long ?? '')
const relevantExperience = computed(
  () => professionalProfile.value?.relevant_experience ?? []
)
const otherExperience = computed(
  () => professionalProfile.value?.other_experience ?? []
)

const formatExperienceDates = (item: {
  from_month?: string
  from_year?: string
  to_month?: string
  to_year?: string
  ongoing?: boolean
}) => {
  const start = [item.from_month, item.from_year].filter(Boolean).join(' ')
  const end = item.ongoing
    ? 'Present'
    : [item.to_month, item.to_year].filter(Boolean).join(' ')
  return [start, end].filter(Boolean).join(' · ')
}

useHead({
  title: computed(() =>
    displayName.value
      ? `${displayName.value} · Professional Profile`
      : 'Professional Profile'
  ),
})

const pageTitle = computed(() => displayName.value || 'Professional Profile')
const pageDescription = computed(() =>
  displayName.value
    ? `Inspect ${displayName.value} and their public details.`
    : 'Inspect the selected professional profile.'
)

const canEdit = computed(
  () =>
    !!(
      appUser.value?.id &&
      professionalProfile.value?.id &&
      appUser.value.id === professionalProfile.value.id
    )
)
</script>
