<!-- Concurrent edit — 2026-07-20 20:03 CEST — Repo Efficiency Pass 2 of 6: make Chef detail endpoint-first and SSR-authoritative. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
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
      <div class="profile-page">
        <div v-if="pending" class="py-10 text-sm opacity-70">
          Loading profile…
        </div>

        <UAlert
          v-else-if="failed"
          color="error"
          variant="soft"
          title="Chef unavailable"
          description="This profile could not be loaded right now. Please try again."
        />

        <div v-else-if="missing" class="space-y-2">
          <h1 class="text-lg font-semibold">Profile Not Found</h1>
          <p>The profile you're looking for doesn't exist.</p>
          <NuxtLink to="/chefs" class="text-primary hover:underline"
            >← Back</NuxtLink
          >
        </div>

        <div v-else-if="profile" class="space-y-4" data-public-profile="chef">
          <ChefCardsProfile
            v-if="chefCard"
            :card="chefCard"
            :profile="profile"
          />

          <DevJson
            :title="'Chef (Public DTO)'"
            context="Chef detail page · chefs/[id] · endpoint-first SSR"
            :data="devPayload"
            :default-open="false"
          />
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, setResponseStatus } from '#imports'
import { usePublicProfileDetail } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileDetail'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useChefSeo } from '../../composables/fireux/firestore/profiles/Chef/utils/useChefSeo'
import { useChefInterface } from '../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import type { PublicChefProfilePayload } from '../../models/chef.model'

definePageMeta({
  visibility: { profiles: ['chef'] },
})

const routeId = useRouteParam('id')
const docId = computed(() => routeId.value || null)

const {
  profile,
  user: profileUser,
  pending,
  statusCode,
  missing,
  failed,
  outcome,
} = await usePublicProfileDetail<PublicChefProfilePayload>(
  { collection: 'chefs', kind: 'chef' },
  docId
)
const { user: sessionUser } = useUser()
const { profile: chefInterface } = useChefInterface()
const chefCard = computed(() =>
  profile.value ? chefInterface(profile.value, profileUser.value) : null
)

const displayName = computed(
  () => profileUser.value?.display_name || profile.value?.title || null
)
const pageTitle = computed(() => displayName.value ?? 'Chef Profile')
const pageDescription = computed(() =>
  displayName.value ? `Inspect ${displayName.value}.` : 'Chef profile details.'
)

useChefSeo(profile, { id: docId, displayName })

const isSelf = computed(() =>
  Boolean(docId.value && sessionUser.value?.id === docId.value)
)

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

const devPayload = computed(() => ({
  profile: profile.value,
  user: profileUser.value,
  outcome: outcome.value,
}))
</script>
