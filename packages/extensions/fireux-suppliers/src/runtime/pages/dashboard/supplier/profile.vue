<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/profile.vue -->
<template>
  <UDashboardPanel id="console-supplier-profile">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle">
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
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <div class="console-profile__pills">
          <ProfilesSupplierCardsPill
            v-if="supplierCard"
            v-bind="supplierCard"
            :link="Boolean(supplierCard.to)"
            class="block"
          />
        </div>

        <UPageCard v-if="isProfileLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading profile…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!resolvedCoreProfile"
          title="Supplier profile not available"
          description="Your supplier profile hasn’t been created yet."
          variant="subtle"
        >
          <UButton
            :label="supplierConfig.cta || 'Create Supplier profile'"
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
            <ProfilesSupplierCardsProfile
              v-if="supplierCard"
              :card="supplierCard"
            />
          </div>

          <div v-else class="console-profile__section">
            <ProfilesSupplierEditCore
              :supplier="resolvedCoreProfile"
            />

            <ProfilesSupplierEditApp
              v-if="resolvedAppProfile"
              :supplier="resolvedAppProfile"
            />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { computed, ref } from 'vue'
import { useSupplier } from 'fireux-suppliers/runtime/composables/supplier/ops/useSupplier'
import { supplierConfig } from 'fireux-suppliers/runtime/composables/supplier/supplierConfig'

const navLabel = supplierConfig.navLabel ?? `${supplierConfig.profileType} Profile`
const navIcon = supplierConfig.navIcon ?? 'i-lucide-package'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile, card: supplierCardFromProfile } = useSupplier()

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
const supplierCard = computed(() => supplierCardFromProfile(resolvedCoreProfile.value))

const { view, viewIcon, toggleView } = useConsoleProfileView()
</script>
