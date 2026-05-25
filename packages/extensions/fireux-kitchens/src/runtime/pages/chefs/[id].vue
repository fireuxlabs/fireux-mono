<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="profile && isAdminUser && docId"
          icon="i-lucide-shield"
          size="xs"
          color="primary"
          variant="solid"
          :to="`/chefs/admin/${docId}`"
        >
          Admin
        </UButton>
        <UButton
          v-if="profile && isSelf"
          icon="i-lucide-pencil"
          size="xs"
          color="neutral"
          variant="soft"
          @click="navigateTo('/dashboard/chef/profile')"
        >
          Manage profile
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ClientOnly>
        <div class="profile-page">
          <div v-if="loading" class="py-10 text-sm opacity-70">Loading profile…</div>

          <div v-else-if="!profile" class="space-y-2">
            <MoleculesProfilesAdminCreateCard
              v-if="isAdminUser"
              title="Chef profile not available"
              description="Create a chef profile for this user."
              :button-label="chefConfig.cta || 'Create Chef profile'"
              :loading="isCreating"
              :error="createError"
              @create="createProfile"
            />

            <div v-else>
              <h1 class="text-lg font-semibold">Profile Not Found</h1>
              <p>The profile you're looking for doesn't exist.</p>
              <NuxtLink to="/chefs" class="text-primary hover:underline">← Back</NuxtLink>
            </div>
          </div>

          <div v-else class="space-y-4">
            <ChefCardsProfile v-if="chefCard" :card="chefCard" :profile="profile" />

            <DevJson
              v-if="isDev && profile"
              :title="'Chef (Doc)'"
              context="Chef detail page · chefs/[id] · profile doc"
              :data="profile"
              :default-open="false"
            />
          </div>
        </div>

        <template #fallback>
          <div class="py-10 text-sm opacity-70">Loading profile…</div>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { chefConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Chef/config/chefConfig'
import { computed, ref } from 'vue'
import { useChefSeo } from '../../composables/fireux/firestore/profiles/Chef/seo/useChefSeo'
import { useChefInterface } from '../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import type { AppChef, Chef } from '../../models/profiles/Chef/Chef.model'

definePageMeta({
  visibility: { profiles: ['chef'] },
})

const route = useRoute()
const docId = computed(() => {
  const raw = route.params.id
  const value = Array.isArray(raw) ? raw[0] : raw
  return String(value ?? '').trim() || null
})

const { user, coreUser, appUser } = useUser()
const userRefs = useUserFetch(docId)

const { profile: profileRefs, pending } = useProfileFetch<Chef, AppChef>(
  docId,
  chefConfig
)
const profile = computed<Chef | null>(() => profileRefs.coreProfile.value ?? null)
const loading = computed(() => pending.value)
const { profile: chefInterface } = useChefInterface(profileRefs, userRefs.user)
const chefCard = computed(() =>
  profile.value ? chefInterface(profile.value, userRefs.user.value ?? null) : null
)

const resolveName = (p: any) =>
  p?.display_name ||
  p?.name ||
  p?.title ||
  p?.agency_name ||
  p?.company_name ||
  p?.business_name ||
  p?.professional_name ||
  'Profile'

const displayName = computed(() =>
  userRefs.user.value?.display_name || (profile.value ? resolveName(profile.value) : null)
)
const pageTitle = computed(() => displayName.value ?? 'Chef Profile')
const pageDescription = computed(() =>
  displayName.value
    ? `Inspect ${displayName.value}.`
    : 'Chef profile details.'
)
const isDev = import.meta.dev

useChefSeo(profile, { id: docId, displayName })

const isSelf = computed(() =>
  Boolean(docId.value && user.value?.id === docId.value)
)

const isAdminUser = computed(() =>
  appUser.value?.role === 'admin'
)

const { ensure } = useProfileEnsure(chefConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value || !docId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure(docId.value)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}
</script>
