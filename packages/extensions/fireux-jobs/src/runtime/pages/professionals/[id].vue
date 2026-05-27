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
          v-if="professionalProfile && isAdminUser && professionalId"
          icon="i-lucide-shield"
          size="xs"
          color="primary"
          variant="solid"
          :to="`/professionals/admin/${professionalId}`"
        >
          Admin
        </UButton>
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

      <div v-else-if="!professionalProfile">
        <MoleculesProfilesAdminCreateCard
          v-if="isAdminUser"
          title="Professional profile not available"
          description="Create a professional profile for this user."
          :button-label="
            professionalConfig.cta || 'Create Professional profile'
          "
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <div v-else>
          <h1>Profile Not Found</h1>
          <p>The profile you're looking for doesn't exist.</p>
          <NuxtLink to="/professionals">← Back</NuxtLink>
        </div>
      </div>

      <div v-else>
        <ProfessionalCardsProfile
          v-if="professionalProfileView"
          :model="professionalProfileView"
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
import { navigateTo, useRoute } from '#imports'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'
import { computed, ref } from 'vue'
import { useProfessionalSeo } from '../../composables/fireux/firestore/profiles/Professional/utils/useProfessionalSeo'
import { useProfessionalComputed } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalComputed'
import { useProfessionalInterface } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import { useProfessionalProfileView } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalProfileView'
import type {
  AppProfessional,
  Professional,
} from '../../models/profiles/Professional/Professional.model'

definePageMeta({
  visibility: { profiles: ['professional'] },
})

const route = useRoute()
const professionalId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const { profile, pending } = useProfileFetch<Professional, AppProfessional>(
  professionalId,
  professionalConfig
)

const { computed: professionalComputed } = useProfessionalComputed(
  profile,
  pending
)

const professionalProfile = computed(() => profile.coreProfile.value ?? null)

const { user } = useUserFetch(professionalId)
const { coreUser, appUser, user: sessionUser } = useUser()

const { profile: professionalInterface } = useProfessionalInterface(profile)
const professionalCard = computed(() => {
  if (!professionalProfile.value) return null
  const resolved = user.value
    ? ({ ...professionalProfile.value, user: user.value } as Professional & {
        user: typeof user.value
      })
    : professionalProfile.value
  return professionalInterface(resolved)
})
const { model: professionalProfileView } = useProfessionalProfileView(
  professionalProfile,
  professionalCard
)

const displayName = computed(() => user.value?.display_name ?? '')

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

const isAdminUser = computed(
  () => appUser.value?.role === 'admin'
)

const { createProfile: createProfileRecord } = useProfileCreate(professionalConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)
const isDev = import.meta.dev
const showBusinessCard = ref(false)
const canShowQr = computed(() => Boolean(sessionUser.value?.id))

useProfessionalSeo(professionalProfile, { id: professionalId, displayName })

const createProfile = async () => {
  if (isCreating.value || !professionalId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await createProfileRecord(professionalId.value)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}

const devPayload = computed(() => ({
  profile: professionalProfile.value,
  user: user.value,
  computed: professionalComputed.value,
}))
</script>
