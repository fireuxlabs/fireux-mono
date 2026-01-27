<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-profile">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="flex flex-wrap items-center gap-2">
          <OrganismsAppCardsPill
            v-if="appCard"
            :to="appCard.to"
            :thumbnail-url="appCard.thumbnailUrl"
            :display-name="appCard.displayName"
            :ecosystem="appCard.ecosystem"
            :badges="appCard.badges"
            :show-subtitle="false"
            :link="Boolean(appCard.to)"
            class="block"
          />

          <OrganismsUserCardsPill
            v-if="userCard"
            v-bind="userCard"
            :show-subtitle="false"
            :link="Boolean(userCard.to)"
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
          <LayoutsDashboardProfileEdit class="panels-masonry">
            <template #preview>
              <OrganismsProfilesProfessionalEditPreviewPanel />
            </template>

            <template #core>
              <OrganismsProfilesProfessionalEditCore
                :professional="resolvedCoreProfile"
              />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesProfessionalEditApp
                :professional="resolvedAppProfile"
              />
            </template>
          </LayoutsDashboardProfileEdit>

          <DevJson
            v-if="isDev"
            :title="'Professional Edit (JSON)'"
            context="dashboard professional profile"
            :data="devPayload"
            :default-open="false"
          />
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useApp } from 'fireux-core/runtime/composables/fireux/firestore/core/app/useApp'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'
import { useProfessional } from '../../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'
import { professionalConfig } from '../../../models/profiles/Professional/supporting'

const profileKey = professionalConfig.id ?? 'professional'
const navLabel =
  professionalConfig.navLabel ?? `${professionalConfig.profileType} Profile`
const navIcon = professionalConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useProfessional()
const { app, card: appToCard } = useApp()
const { user, card: userToCard } = useUser()

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

const userCard = computed(() => userToCard(user.value))
const appCard = computed(() => appToCard(app.value))
</script>
