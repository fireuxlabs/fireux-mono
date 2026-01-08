<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <div v-if="pending" class="py-10 text-sm opacity-70">Loading profile…</div>

      <div v-else-if="!professionalProfile" class="space-y-2">
        <h1 class="text-lg font-semibold">Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/professionals" class="text-primary hover:underline">← Back</NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-if="canEdit">
          <UButton
            icon="i-lucide-pencil"
            size="md"
            color="primary"
            variant="solid"
            @click="navigateTo('/dashboard/professional/profile')"
          >
            Edit Profile
          </UButton>
        </div>

        <OrganismsProfilesProfessionalCardsProfile
          v-if="professionalCard"
          :card="professionalCard"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional/Professional.model.ts'
import { computed } from 'vue'
import { navigateTo, useHead, useRoute } from '#imports'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useProfessionalInterface } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalProfile } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'

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

const { appUser } = useUser()

const { card } = useProfessionalInterface(profile)
const professionalCard = computed(() => card())

const resolveName = (p: any) =>
  p?.display_name ||
  p?.name ||
  p?.title ||
  p?.agency_name ||
  p?.company_name ||
  p?.business_name ||
  p?.professional_name ||
  'Profile'

useHead({
  title: computed(() =>
    professionalProfile.value
      ? `${resolveName(professionalProfile.value)} · Professional Profile`
      : 'Professional Profile'
  ),
})

const displayName = computed(() =>
  professionalProfile.value ? resolveName(professionalProfile.value) : null
)
const pageTitle = computed(() => displayName.value ?? 'Professional Profile')
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
