<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue -->
<template>
  <UDashboardPanel
    id="console-professional-profile"
    :ui="{ body: 'flex flex-col gap-4 flex-1 overflow-y-auto p-2 sm:p-4' }"
  >
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle">
        <template #right>
          <UButton
            :icon="viewIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            :aria-pressed="view === 'profile'"
            @click="toggleView"
          />
        </template>
      </LayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="console-profile">
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

        <UPageCard
          v-else-if="!resolvedCoreProfile"
          title="Professional profile not available"
          description="Your professional profile hasn’t been created yet."
          variant="subtle"
        >
          <UButton
            :label="professionalConfig.cta || 'Create Professional profile'"
            color="neutral"
            :loading="isCreating"
            @click="createProfile"
          />

          <p v-if="createError" class="mt-3 text-sm text-dimmed">
            {{ createError }}
          </p>
        </UPageCard>

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="console-profile__section">
            <ProfilesProfessionalCardsProfile
              v-if="professionalCard"
              :card="professionalCard"
              :profile="resolvedCoreProfile"
              :computed="professionalComputed"
            />
          </div>

          <div v-else class="console-profile__section">
            <ProfilesProfessionalEditCore
              :professional="resolvedCoreProfile"
            />

            <ProfilesProfessionalEditApp
              v-if="resolvedAppProfile"
              :professional="resolvedAppProfile"
            />
          </div>

          <DevJson
            v-if="isDev"
            :title="'Professional Edit (JSON)'"
            context="console professional profile"
            :data="devPayload"
            :default-open="false"
          />
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { computed, ref } from 'vue'
import { useProfessional } from '../../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'

const profileKey = professionalConfig.id ?? 'professional'
const navLabel =
  professionalConfig.navLabel ?? `${professionalConfig.profileType} Profile`
const navIcon = professionalConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'] },
    key: 'dashboard-professional-profile',
    label: navLabel,
    icon: navIcon,
    position: 'middle',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const {
  coreProfile,
  appProfile,
  profile: professionalCardFromProfile,
  computed: professionalComputed,
} = useProfessional()

const { ensure } = useProfileEnsure(professionalConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure()
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
const isDev = import.meta.dev
const devPayload = computed(() => ({
  coreProfile: resolvedCoreProfile.value,
  appProfile: resolvedAppProfile.value,
}))

const professionalCard = computed(() => professionalCardFromProfile(resolvedCoreProfile.value))

const { view, viewIcon, toggleView } = useConsoleProfileView()
</script>
