<template>
  <UserProfileDetailSurface
    entity-label="Hiring profile"
    plural-label="Hiring profiles"
    back-to="/agents"
    icon="i-lucide-handshake"
    :pending="pending"
    :failed="failed"
    :missing="missing"
  >
    <div v-if="agentProfile && profileUser" data-public-profile="agent">
      <AgentDetail :profile="agentProfile" :user="profileUser" />

      <FireDiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Agent (Public DTO)"
        context="Agent detail · agents/[handle] · endpoint-first SSR"
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
import { useAgentSeo } from '../../user/composables/profiles/Agent/utils/useAgentSeo'
import type { AgentProfilePayload } from '../../user/utils/profiles/Agent/agent'

definePageMeta({
  visibility: { profiles: ['agent'] },
})

const routeHandle = useRouteParam('handle')
const requestedIdentifier = computed(() => routeHandle.value || null)

const {
  profile: agentProfile,
  user: profileUser,
  pending,
  statusCode,
  missing,
  failed,
  outcome,
} = await useProfileDetail<AgentProfilePayload>(
  { collection: 'agents', kind: 'agent' },
  requestedIdentifier
)

const canonicalHandle = computed(() =>
  String(profileUser.value?.handle || '')
    .trim()
    .toLowerCase()
)
const canonicalPath = computed(() =>
  canonicalHandle.value
    ? `/agents/${encodeURIComponent(canonicalHandle.value)}`
    : ''
)

if (
  canonicalPath.value &&
  requestedIdentifier.value !== canonicalHandle.value
) {
  await navigateTo(canonicalPath.value, { redirectCode: 301, replace: true })
}

const displayName = computed(
  () => profileUser.value?.display_name || agentProfile.value?.title || ''
)
if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

useAgentSeo(agentProfile, { routeKey: canonicalHandle, displayName })

const devObjects = computed(() => ({
  profile: agentProfile.value,
  user: profileUser.value,
}))
const devDerived = computed(() => ({
  outcome: outcome.value,
  canonicalPath: canonicalPath.value,
}))
</script>
