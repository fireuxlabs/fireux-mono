<template>
  <UserProfileDetailSurface
    entity-label="Chef"
    plural-label="Chefs"
    back-to="/chefs"
    icon="i-lucide-chef-hat"
    :pending="pending"
    :failed="failed"
    :missing="missing"
  >
    <div v-if="profile && chefCard" data-public-profile="chef">
      <ChefCardsProfile :card="chefCard" :profile="profile">
        <template #actions>
          <UButton
            v-if="isSelf"
            label="Manage profile"
            icon="i-lucide-pencil"
            color="neutral"
            variant="outline"
            @click="navigateTo('/dashboard/chef/profile')"
          />
        </template>
      </ChefCardsProfile>

      <DiagnosticsDebugPanel
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
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { navigateTo, setResponseStatus } from '#imports'
import { useProfileDetail } from 'fireux-core/runtime/user/composables/profile/useProfileDetail'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useChefSeo } from '../../user/composables/chef/useChefSeo'
import { useChefInterface } from '../../user/composables/chef/useChefInterface'
import type { ChefProfilePayload } from '../../user/utils/chef.ts'

definePageMeta({
  visibility: { profiles: ['chef'] },
})

const routeHandle = useRouteParam('handle')
const requestedIdentifier = computed(() => routeHandle.value || null)

const {
  profile,
  user: profileUser,
  pending,
  statusCode,
  missing,
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

const { user: sessionUser } = useUserSession()
const { profile: chefInterface } = useChefInterface()
const chefCard = computed(() =>
  profile.value ? chefInterface(profile.value, profileUser.value) : null
)
const displayName = computed(
  () => profileUser.value?.display_name || profile.value?.title || ''
)
const isSelf = computed(() =>
  Boolean(
    profileUser.value?.id && sessionUser.value?.id === profileUser.value.id
  )
)

if (import.meta.server) {
  if (missing.value) {
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
