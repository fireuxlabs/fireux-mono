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
          <ProfilesChefCardsPill
            v-if="chefCard"
            v-bind="chefCard"
            :link="Boolean(chefCard.to)"
            class="block"
          />
        </div>

        <UPageCard v-if="isProfileLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading profile…</p>
        </UPageCard>

        <MoleculesProfilesAdminCreateCard
          v-else-if="!resolvedCoreProfile"
          title="Chef profile not available"
          description="This chef profile hasn’t been created yet."
          :button-label="chefConfig.cta || 'Create Chef profile'"
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="console-profile__section">
            <ProfilesChefCardsProfile
              v-if="chefCard"
              :card="chefCard"
              :profile="resolvedCoreProfile"
            />
          </div>

          <div v-else class="console-profile__section">
            <ProfilesChefEditCore :chef="resolvedCoreProfile" />

            <ProfilesChefEditApp
              v-if="resolvedAppProfile"
              :chef="resolvedAppProfile"
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
import { chefConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Chef/config/chefConfig'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useChefInterface } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import type { AppChef, Chef } from '../../../models/profiles/Chef/Chef.model'

definePageMeta({
  layout: 'default',
  name: 'ChefsAdminEditPage',
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
const { profile, pending } = useProfileFetch<Chef, AppChef>(
  userId,
  chefConfig
)
const { coreProfile, appProfile } = profile

const { profile: makeCard } = useChefInterface(profile, userRefs.user)

const isProfileLoading = computed(
  () => pending.value || coreProfile.value === undefined
)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
const chefCard = computed(() => makeCard(resolvedCoreProfile.value))
const pageTitle = computed(() =>
  chefCard.value?.displayName
    ? `Admin · ${chefCard.value.displayName}`
    : userId.value
      ? `Admin · Chef · ${userId.value}`
      : 'Admin · Chef Profile'
)
const pageDescription = computed(
  () => 'Review the public profile and edit the underlying chef documents.'
)

const { ensure } = useProfileEnsure(chefConfig)
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
