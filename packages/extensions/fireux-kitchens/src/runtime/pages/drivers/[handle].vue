<template>
  <PublicProfileDetailSurface
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

      <DevJson
        title="Driver (Public DTO)"
        context="Driver detail · drivers/[handle] · endpoint-first SSR"
        :data="devPayload"
        :default-open="false"
      />
    </div>
  </PublicProfileDetailSurface>
</template>

<script setup lang="ts">
import { navigateTo, setResponseStatus } from '#imports'
import { usePublicProfileDetail } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileDetail'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useDriverSeo } from '../../composables/fireux/firestore/profiles/Driver/utils/useDriverSeo'
import { useDriverInterface } from '../../composables/fireux/firestore/profiles/Driver/utils/view/useDriverInterface'
import type { PublicDriverProfilePayload } from '../../models/driver.model'

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
} = await usePublicProfileDetail<PublicDriverProfilePayload>(
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

const { user: sessionUser } = useUser()
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

const devPayload = computed(() => ({
  profile: profile.value,
  user: profileUser.value,
  outcome: outcome.value,
  canonicalPath: canonicalPath.value,
}))
</script>
