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

        <MoleculesProfilesAdminCreateCard
          v-else-if="!resolvedCoreProfile"
          title="Supplier profile not available"
          description="This supplier profile hasn’t been created yet."
          :button-label="supplierConfig.cta || 'Create Supplier profile'"
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="console-profile__section">
            <ProfilesSupplierCardsProfile
              v-if="supplierCard"
              :card="supplierCard"
            />
          </div>

          <div v-else class="console-profile__section">
            <ProfilesSupplierEditCore :supplier="resolvedCoreProfile" />

            <ProfilesSupplierEditApp
              v-if="resolvedAppProfile"
              :supplier="resolvedAppProfile"
            />
          </div>
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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSupplierInterface } from '../../../composables/supplier/view/useSupplierInterface'
import type { SupplierApp, SupplierCore } from '../../../models/supplier/Supplier.model'
import { supplierConfig } from '../../../composables/supplier/supplierConfig'

definePageMeta({
  layout: 'default',
  name: 'SuppliersAdminEditPage',
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
  userId.value ? `Admin · Supplier · ${userId.value}` : 'Admin · Supplier'
)
const pageDescription = 'Admin edit supplier profile.'

const userRefs = useUserFetch(userId)
const { profile, pending } = useProfileFetch<SupplierCore, SupplierApp>(
  userId,
  supplierConfig
)
const { coreProfile, appProfile } = profile

const { card: makeCard } = useSupplierInterface(profile, userRefs.user)

const isProfileLoading = computed(
  () => pending.value || coreProfile.value === undefined
)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
const supplierCard = computed(() => makeCard(resolvedCoreProfile.value))

const { ensure } = useProfileEnsure(supplierConfig)
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
