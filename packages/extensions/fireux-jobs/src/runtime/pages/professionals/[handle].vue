<template>
  <UserProfileDetailSurface
    entity-label="Professional"
    plural-label="Professionals"
    back-to="/professionals"
    icon="i-lucide-briefcase-business"
    :pending="pending"
    :failed="failed"
    :empty="empty"
  >
    <div
      v-if="professionalProfile && profileUser"
      data-public-profile="professional"
    >
      <ProfessionalDetail :profile="professionalProfile" :user="profileUser" />

      <FireDiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Professional (Public DTO)"
        context="Professional detail · professionals/[handle] · endpoint-first SSR"
        :objects="devObjects"
        :derived="devDerived"
        :default-open="false"
      />
    </div>
  </UserProfileDetailSurface>
</template>

<script setup lang="ts">
import { navigateTo, setResponseStatus } from '#imports'
import { useProfileDetail } from 'fireux-core/runtime/user/composables/profile/useProfileDetail'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useProfessionalSeo } from '../../user/composables/profiles/Professional/utils/useProfessionalSeo'
import type { ProfessionalProfilePayload } from '../../user/utils/profiles/Professional/professional'

definePageMeta({
  visibility: { profiles: ['professional'] },
})

const routeHandle = useRouteParam('handle')
const requestedIdentifier = computed(() => routeHandle.value || null)

const {
  profile: professionalProfile,
  user: profileUser,
  pending,
  statusCode,
  empty,
  failed,
  outcome,
} = await useProfileDetail<ProfessionalProfilePayload>(
  { collection: 'professionals', kind: 'professional' },
  requestedIdentifier
)

const canonicalHandle = computed(() =>
  String(profileUser.value?.handle || '')
    .trim()
    .toLowerCase()
)
const canonicalPath = computed(() =>
  canonicalHandle.value
    ? `/professionals/${encodeURIComponent(canonicalHandle.value)}`
    : ''
)

if (
  canonicalPath.value &&
  requestedIdentifier.value !== canonicalHandle.value
) {
  await navigateTo(canonicalPath.value, { redirectCode: 301, replace: true })
}

const displayName = computed(() => profileUser.value?.display_name ?? '')
if (import.meta.server) {
  if (empty.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

useProfessionalSeo(professionalProfile, {
  routeKey: canonicalHandle,
  displayName,
})

const devObjects = computed(() => ({
  profile: professionalProfile.value,
  user: profileUser.value,
}))
const devDerived = computed(() => ({
  outcome: outcome.value,
  canonicalPath: canonicalPath.value,
}))
</script>

<style>
@media print {
  body:has([data-public-profile='professional']) [data-fireux-header-root],
  body:has([data-public-profile='professional']) .fx-layout-shell > footer,
  body:has([data-public-profile='professional']) .fireux-dev-json {
    display: none !important;
  }

  body:has([data-public-profile='professional']) .fx-layout-main > div {
    max-width: none;
    padding-left: 0;
    padding-right: 0;
  }

  body:has([data-public-profile='professional']) .pagebody {
    margin-top: 0;
    padding-bottom: 0;
  }
}
</style>
