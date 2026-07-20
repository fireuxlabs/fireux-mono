<!-- Concurrent edit — 2026-07-20 20:03 CEST — Repo Efficiency Pass 2 of 6: make Professional detail endpoint-first and SSR-authoritative. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="canShowQr"
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-qr-code"
          @click="showBusinessCard = true"
        />
        <UButton
          v-if="professionalProfile && isSelf"
          icon="i-lucide-pencil"
          size="xs"
          color="neutral"
          variant="soft"
          @click="navigateTo('/dashboard/professional/profile')"
        >
          Manage profile
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <div v-if="pending">Loading profile…</div>

      <UAlert
        v-else-if="failed"
        color="error"
        variant="soft"
        title="Professional unavailable"
        description="This profile could not be loaded right now. Please try again."
      />

      <div v-else-if="missing">
        <h1>Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/professionals">← Back</NuxtLink>
      </div>

      <div v-else-if="professionalProfile" data-public-profile="professional">
        <ProfessionalCardsProfile
          v-if="professionalProfileView"
          :model="professionalProfileView"
        />

        <DevJson
          :title="'Professional (JSON)'"
          context="professionals-id page"
          :data="devPayload"
          :default-open="false"
        />
      </div>
    </UPageBody>

    <UModal v-model="showBusinessCard">
      <div class="p-4 space-y-3">
        <div class="text-sm font-semibold">Professional card</div>
        <ProfessionalCardsCell
          v-if="professionalCard"
          v-bind="professionalCard"
          :link="Boolean(professionalCard.to)"
        />
        <p v-else class="text-sm text-dimmed">Professional card unavailable.</p>
      </div>
    </UModal>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, setResponseStatus } from '#imports'
import { usePublicProfileDetail } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileDetail'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed, ref } from 'vue'
import { useProfessionalSeo } from '../../composables/fireux/firestore/profiles/Professional/utils/useProfessionalSeo'
import { useProfessionalInterface } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import { useProfessionalProfileView } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalProfileView'
import type { PublicProfessionalProfilePayload } from '../../models/profiles/Professional/Professional.model'

definePageMeta({
  visibility: { profiles: ['professional'] },
})

const routeProfessionalId = useRouteParam('id')
const professionalId = computed(() => routeProfessionalId.value || null)

const {
  profile: professionalProfile,
  user: profileUser,
  pending,
  statusCode,
  missing,
  failed,
  outcome,
} = await usePublicProfileDetail<PublicProfessionalProfilePayload>(
  { collection: 'professionals', kind: 'professional' },
  professionalId
)

const { user: sessionUser } = useUser()

const { profile: professionalInterface } = useProfessionalInterface()
const professionalCard = computed(() => {
  if (!professionalProfile.value) return null
  return professionalInterface(professionalProfile.value, profileUser.value)
})
const { model: professionalProfileView } = useProfessionalProfileView(
  professionalProfile,
  professionalCard
)

const displayName = computed(() => profileUser.value?.display_name ?? '')

const pageTitle = computed(() => displayName.value || 'Professional Profile')
const pageDescription = computed(() => {
  const positions = professionalProfile.value?.positions ?? []
  const label = positions.filter(Boolean).join(' · ')
  return label || 'Professional profile.'
})

const isSelf = computed(() =>
  Boolean(
    professionalId.value && sessionUser.value?.id === professionalId.value
  )
)

const showBusinessCard = ref(false)
const canShowQr = computed(() => Boolean(sessionUser.value?.id))

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

useProfessionalSeo(professionalProfile, { id: professionalId, displayName })

const devPayload = computed(() => ({
  profile: professionalProfile.value,
  user: profileUser.value,
  outcome: outcome.value,
}))
</script>
