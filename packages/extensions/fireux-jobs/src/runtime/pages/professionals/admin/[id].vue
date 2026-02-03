<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <div class="dashboard-profile">
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

        <div class="dashboard-profile__pills">
          <OrganismsProfilesProfessionalCardsPill
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
          :button-label="professionalConfig.cta || 'Create Professional profile'"
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="dashboard-profile__section">
            <OrganismsProfilesProfessionalCardsProfile
              v-if="professionalCard"
              :card="professionalCard"
              :profile="resolvedCoreProfile"
              :computed="professionalComputed"
            />
          </div>

          <div v-else class="dashboard-profile__section">
            <OrganismsProfilesProfessionalEditCore
              :professional="resolvedCoreProfile"
            />

            <OrganismsProfilesProfessionalEditApp
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
import { useDashboardProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useDashboardProfileView'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProfessionalComputed } from '../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalComputed'
import { useProfessionalInterface } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalApp, ProfessionalCore } from '../../../models/profiles/Professional/Professional.model'
import { professionalConfig } from '../../../models/profiles/Professional/supporting'

definePageMeta({
  layout: 'default',
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

const pageTitle = computed(() =>
  userId.value ? `Admin · Professional · ${userId.value}` : 'Admin · Professional'
)
const pageDescription = 'Admin edit professional profile.'

const userRefs = useUserFetch(userId)
const { profile, pending } = useProfileFetch<ProfessionalCore, ProfessionalApp>(
  userId,
  professionalConfig
)
const { coreProfile, appProfile } = profile
const { computed: professionalComputed } = useProfessionalComputed(profile, pending)

const { card: makeCard } = useProfessionalInterface(profile)

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
      } as ProfessionalCore & { user: typeof userRefs.user.value })
    : resolvedCoreProfile.value
  return makeCard(resolved)
})
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

const { view, viewIcon, toggleView } = useDashboardProfileView()
</script>
