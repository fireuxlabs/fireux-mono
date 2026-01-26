<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-profile">
    <template #header>
      <UDashboardNavbar :title="navTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard v-if="isProfileLoading">
          <div class="fallback loading">
            Professional profile data is loading.
          </div>
        </UCard>

        <UCard v-else-if="!resolvedCoreProfile">
          <div class="fallback">
            <p class="mb-4">Your professional profile hasn’t been created yet.</p>

            <UButton
              :label="professionalConfig.cta || 'Create Professional profile'"
              color="neutral"
              :loading="isCreating"
              @click="createProfile"
            />

            <p v-if="createError" class="mt-3 text-sm text-dimmed">
              {{ createError }}
            </p>
          </div>
        </UCard>

        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="grid gap-6 lg:grid-cols-2">
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
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
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
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
