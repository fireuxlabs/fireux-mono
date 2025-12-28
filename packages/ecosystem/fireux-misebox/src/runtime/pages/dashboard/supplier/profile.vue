<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-supplier-profile">
    <template #header>
      <UDashboardNavbar title="Supplier Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard v-if="isProfileLoading">
          <div class="fallback loading">Supplier profile data is loading.</div>
        </UCard>

        <UCard v-else-if="!resolvedCoreProfile">
          <div class="fallback">
            <p class="mb-4">Your supplier profile hasn’t been created yet.</p>

            <UButton
              :label="supplierConfig.cta || 'Create Supplier profile'"
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
              <OrganismsProfilesSupplierEditPreview />
            </template>

            <template #core>
              <OrganismsProfilesSupplierEditCore
                :supplier="resolvedCoreProfile"
              />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesSupplierEditApp
                :supplier="resolvedAppProfile"
              />
            </template>
          </LayoutsDashboardProfileEdit>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useSupplier } from '../../../composables/fireux/firestore/profiles/Supplier/useSupplier'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { supplierConfig } from '../../../models/profiles/Supplier/Supplier.model'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-supplier-profile',
    label: 'Supplier Profile',
    icon: 'i-lucide-package',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useSupplier()

const { ensure } = useProfileEnsure(supplierConfig)
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
