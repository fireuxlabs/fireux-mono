<template>
  <UserProfileDetailSurface
    entity-label="Chef"
    plural-label="Chefs"
    back-to="/chefs"
    icon="i-lucide-chef-hat"
    :pending="pending"
    :failed="failed"
    :empty="empty"
  >
    <div v-if="profile" data-public-profile="chef">
      <ChefDetail v-if="profileUser" :profile="profile" :user="profileUser" />

      <FireDiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Chef (Public DTO)"
        context="Chef detail · chefs/[handle] · endpoint-first SSR"
        :objects="devObjects"
        :derived="devDerived"
        :default-open="false"
      />
    </div>
  </UserProfileDetailSurface>
</template>

<script setup lang="ts">
definePageMeta({
  visibility: { profiles: ['chef'] },
})

import { navigateTo, setResponseStatus } from '#imports'
import { useProfileDetail } from 'fireux-core/runtime/user/composables/profile/useProfileDetail'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useChefSeo } from '../../user/composables/chef/useChefSeo'
import type { ChefProfilePayload } from '../../user/utils/chef.ts'

const routeHandle = useRouteParam('handle')
const requestedIdentifier = computed(() => routeHandle.value || null)

const {
  profile,
  user: profileUser,
  pending,
  statusCode,
  empty,
  failed,
  outcome,
} = await useProfileDetail<ChefProfilePayload>(
  { collection: 'chefs', kind: 'chef' },
  requestedIdentifier
)

const canonicalHandle = computed(() =>
  String(profileUser.value?.handle || '')
    .trim()
    .toLowerCase()
)
const canonicalPath = computed(() =>
  canonicalHandle.value
    ? `/chefs/${encodeURIComponent(canonicalHandle.value)}`
    : ''
)

if (
  canonicalPath.value &&
  requestedIdentifier.value !== canonicalHandle.value
) {
  await navigateTo(canonicalPath.value, { redirectCode: 301, replace: true })
}

const displayName = computed(
  () => profileUser.value?.display_name || profile.value?.title || ''
)
if (import.meta.server) {
  if (empty.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

useChefSeo(profile, { routeKey: canonicalHandle, displayName })

const devObjects = computed(() => ({
  profile: profile.value,
  user: profileUser.value,
}))
const devDerived = computed(() => ({
  outcome: outcome.value,
  canonicalPath: canonicalPath.value,
}))
</script>
