<template>
  <UserProfileDetailSurface
    entity-label="Driver"
    plural-label="Drivers"
    back-to="/drivers"
    icon="i-lucide-truck"
    :pending="pending"
    :failed="failed"
    :missing="missing"
  >
    <div v-if="profile && driverCard" data-public-profile="driver">
      <DriverCardsProfile :card="driverCard" :profile="profile">
        <template #actions>
          <UButton
            v-if="isSelf"
            label="Open driver dashboard"
            icon="i-lucide-gauge"
            color="neutral"
            variant="outline"
            @click="navigateTo('/dashboard/driver')"
          />
        </template>
      </DriverCardsProfile>

      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Driver (Public DTO)"
        context="Driver detail · drivers/[handle] · endpoint-first SSR"
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
import { useDriverSeo } from '../../user/composables/driver/useDriverSeo'
import { useDriverInterface } from '../../user/composables/driver/useDriverInterface'
import type { DriverProfilePayload } from '../../user/utils/driver.ts'

definePageMeta({
  visibility: { profiles: ['driver'] },
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
} = await useProfileDetail<DriverProfilePayload>(
  { collection: 'drivers', kind: 'driver' },
  requestedIdentifier
)

const canonicalHandle = computed(() =>
  String(profileUser.value?.handle || '')
    .trim()
    .toLowerCase()
)
const canonicalPath = computed(() =>
  canonicalHandle.value
    ? `/drivers/${encodeURIComponent(canonicalHandle.value)}`
    : ''
)

if (
  canonicalPath.value &&
  requestedIdentifier.value !== canonicalHandle.value
) {
  await navigateTo(canonicalPath.value, { redirectCode: 301, replace: true })
}

const { user: sessionUser } = useUserSession()
const { profile: driverInterface } = useDriverInterface()
const driverCard = computed(() =>
  profile.value ? driverInterface(profile.value, profileUser.value) : null
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

useDriverSeo(profile, { routeKey: canonicalHandle, displayName })

const devObjects = computed(() => ({
  profile: profile.value,
  user: profileUser.value,
}))
const devDerived = computed(() => ({
  outcome: outcome.value,
  canonicalPath: canonicalPath.value,
}))
</script>
