<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <div class="console-profile">
        <div class="flex justify-end">
          <UButton
            :icon="viewIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            :aria-pressed="view === 'profile'"
            @click="toggleView"
          />
        </div>

        <div class="console-profile__pills">
          <ProfilesProfessionalCardsPill
            v-if="professionalCard"
            v-bind="professionalCard"
            :link="Boolean(professionalCard.to)"
            class="block"
          />
        </div>

        <UPageCard v-if="isProfileLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading profile…</p>
        </UPageCard>

        <MoleculesProfilesAdminCreateCard
          v-else-if="!resolvedCoreProfile"
          title="Professional profile not available"
          description="This professional profile hasn’t been created yet."
          :button-label="
            professionalConfig.cta || 'Create Professional profile'
          "
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="console-profile__section">
            <ProfilesProfessionalCardsProfile
              v-if="professionalProfileView"
              :model="professionalProfileView"
            />
          </div>

          <div v-else class="console-profile__section">
            <ProfilesProfessionalEditCore :professional="resolvedCoreProfile" />

            <ProfilesProfessionalEditApp
              v-if="resolvedAppProfile"
              :professional="resolvedAppProfile"
            />
          </div>

          <DevJson
            v-if="isDev"
            :title="'Professional Admin (JSON)'"
            context="professionals/admin/[id]"
            :data="devPayload"
            :default-open="false"
          />
        </ClientOnly>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProfessionalComputed } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalComputed'
import { useProfessionalInterface } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import { useProfessionalProfileView } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalProfileView'
import type {
  AppProfessional,
  Professional,
} from '../../../models/profiles/Professional/Professional.model'

definePageMeta({
  layout: 'default',
  visibility: { publicProfiles: ['professional'] },
  name: 'ProfessionalsAdminEditPage',
  requiresAuth: true,
})

const route = useRoute()

const userId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const userRefs = useUserFetch(userId)
const { profile, pending } = useProfileFetch<Professional, AppProfessional>(
  userId,
  professionalConfig
)
const { coreProfile, appProfile } = profile
const { computed: professionalComputed } = useProfessionalComputed(
  profile,
  pending
)

const { profile: makeCard } = useProfessionalInterface(profile)

const isProfileLoading = computed(
  () => pending.value || coreProfile.value === undefined
)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
const professionalCard = computed(() => {
  if (!resolvedCoreProfile.value) return null
  const resolved = userRefs.user.value
    ? ({
        ...resolvedCoreProfile.value,
        user: userRefs.user.value,
      } as Professional & { user: typeof userRefs.user.value })
    : resolvedCoreProfile.value
  return makeCard(resolved)
})
const { model: professionalProfileView } = useProfessionalProfileView(
  resolvedCoreProfile,
  professionalCard
)
const pageTitle = computed(() =>
  professionalCard.value?.displayName
    ? `Admin · ${professionalCard.value.displayName}`
    : userId.value
      ? `Admin · Professional · ${userId.value}`
      : 'Admin · Professional Profile'
)
const pageDescription = computed(
  () =>
    'Review the public profile and edit the underlying professional documents.'
)
const isDev = import.meta.dev
const devPayload = computed(() => ({
  userId: userId.value,
  coreProfile: resolvedCoreProfile.value,
  appProfile: resolvedAppProfile.value,
}))

const { ensure } = useProfileEnsure(professionalConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value || !userId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure(userId.value)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}

const { view, viewIcon, toggleView } = useConsoleProfileView()
</script>
