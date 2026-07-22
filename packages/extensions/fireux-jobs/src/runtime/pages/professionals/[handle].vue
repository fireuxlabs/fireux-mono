<template>
  <PublicProfileDetailSurface
    entity-label="Professional"
    plural-label="Professionals"
    back-to="/professionals"
    icon="i-lucide-briefcase-business"
    :pending="pending"
    :failed="failed"
    :missing="missing"
  >
    <div v-if="professionalProfile" data-public-profile="professional">
      <ProfessionalCardsProfile
        v-if="professionalProfileView"
        :model="professionalProfileView"
      >
        <template #actions>
          <UButton
            v-if="professionalCard"
            label="View compact card"
            icon="i-lucide-contact-round"
            color="neutral"
            variant="soft"
            @click="showBusinessCard = true"
          />
          <UButton
            v-if="isSelf"
            label="Manage profile"
            icon="i-lucide-pencil"
            color="neutral"
            variant="outline"
            @click="navigateTo('/dashboard/professional/profile')"
          />
        </template>
      </ProfessionalCardsProfile>

      <DevJson
        title="Professional (Public DTO)"
        context="Professional detail · professionals/[handle] · endpoint-first SSR"
        :data="devPayload"
        :default-open="false"
      />
    </div>
  </PublicProfileDetailSurface>

  <UModal
    v-model:open="showBusinessCard"
    title="Professional card"
    description="A compact view of this professional identity."
  >
    <template #body>
      <ProfessionalCardsCell
        v-if="professionalCard"
        v-bind="professionalCard"
        :link="Boolean(professionalCard.to)"
      />
    </template>
  </UModal>
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

const routeHandle = useRouteParam('handle')
const requestedIdentifier = computed(() => routeHandle.value || null)

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
  requestedIdentifier
)

const canonicalHandle = computed(() =>
  String(profileUser.value?.handle || '')
    .trim()
    .toLowerCase()
)
const canonicalPath = computed(() =>
  canonicalHandle.value
    ? `/professionals/${encodeURIComponent(canonicalHandle.value)}`
    : ''
)

if (
  canonicalPath.value &&
  requestedIdentifier.value !== canonicalHandle.value
) {
  await navigateTo(canonicalPath.value, { redirectCode: 301, replace: true })
}

const { user: sessionUser } = useUser()
const { profile: professionalInterface } = useProfessionalInterface()
const professionalCard = computed(() =>
  professionalProfile.value
    ? professionalInterface(professionalProfile.value, profileUser.value)
    : null
)
const { model: professionalProfileView } = useProfessionalProfileView(
  professionalProfile,
  professionalCard
)
const displayName = computed(() => profileUser.value?.display_name ?? '')
const isSelf = computed(() =>
  Boolean(
    profileUser.value?.id && sessionUser.value?.id === profileUser.value.id
  )
)
const showBusinessCard = ref(false)

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

useProfessionalSeo(professionalProfile, {
  routeKey: canonicalHandle,
  displayName,
})

const devPayload = computed(() => ({
  profile: professionalProfile.value,
  user: profileUser.value,
  outcome: outcome.value,
  canonicalPath: canonicalPath.value,
}))
</script>
