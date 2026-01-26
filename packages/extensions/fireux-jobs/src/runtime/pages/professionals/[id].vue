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
    <UPageBody>
      <div v-if="pending">Loading profile…</div>

      <div v-else-if="!professionalProfile">
        <h1>Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/professionals">← Back</NuxtLink>
      </div>

      <div v-else>
        <OrganismsProfilesProfessionalCardsProfile
          v-if="professionalCard"
          :card="professionalCard"
          :profile="professionalProfile"
          :computed="professionalComputed"
        />

        <DevJson
          v-if="isDev"
          :title="'Professional (JSON)'"
          context="professionals-id page"
          :data="devPayload"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { computed } from 'vue'
import { useProfessionalComputed } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalComputed'
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

const { computed: professionalComputed } = useProfessionalComputed(profile, pending)

const professionalProfile = computed(() => profile.coreProfile.value ?? null)

const { appUser, user } = useUserFetch(professionalId)

const { card } = useProfessionalInterface(profile, user)
const professionalCard = computed(() =>
  professionalProfile.value ? card(professionalProfile.value) : null
)

const displayName = computed(() => user.value?.display_name ?? '')

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

const isDev = import.meta.dev
const devPayload = computed(() => ({
  profile: professionalProfile.value,
  user: user.value,
  appUser: appUser.value,
  computed: professionalComputed.value,
}))
</script>
