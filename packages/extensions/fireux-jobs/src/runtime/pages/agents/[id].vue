<!-- Concurrent edit — 2026-07-20 20:03 CEST — Repo Efficiency Pass 2 of 6: make Agent detail endpoint-first and SSR-authoritative. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="agentProfile && isSelf"
          icon="i-lucide-pencil"
          size="xs"
          color="neutral"
          variant="soft"
          @click="navigateTo('/dashboard/agent/profile')"
        >
          Manage profile
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <div v-if="pending" class="py-10 text-sm opacity-70">
        Loading profile…
      </div>

      <UAlert
        v-else-if="failed"
        color="error"
        variant="soft"
        title="Agent unavailable"
        description="This profile could not be loaded right now. Please try again."
      />

      <div v-else-if="missing" class="space-y-2">
        <h1 class="text-lg font-semibold">Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/agents" class="text-primary hover:underline"
          >← Back</NuxtLink
        >
      </div>

      <div
        v-else-if="agentProfile"
        class="space-y-4"
        data-public-profile="agent"
      >
        <AgentCardsProfile
          v-if="agentCard"
          :card="agentCard"
          :profile="agentProfile"
        />

        <DevJson
          :title="'Agent (Public DTO)'"
          context="Agent detail page · agents/[id] · endpoint-first SSR"
          :data="devPayload"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, setResponseStatus } from '#imports'
import { usePublicProfileDetail } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileDetail'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import { useAgentSeo } from '../../composables/fireux/firestore/profiles/Agent/utils/useAgentSeo'
import { useAgentInterface } from '../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import type { PublicAgentProfilePayload } from '../../models/profiles/Agent/Agent.model'

definePageMeta({
  visibility: { profiles: ['agent'] },
})

const routeAgentId = useRouteParam('id')
const agentId = computed(() => routeAgentId.value || null)

const {
  profile: agentProfile,
  user: profileUser,
  pending,
  statusCode,
  missing,
  failed,
  outcome,
} = await usePublicProfileDetail<PublicAgentProfilePayload>(
  { collection: 'agents', kind: 'agent' },
  agentId
)

const { user: sessionUser } = useUser()
const { profile: agentInterface } = useAgentInterface()
const agentCard = computed(() =>
  agentProfile.value
    ? agentInterface(agentProfile.value, profileUser.value)
    : null
)

const displayName = computed(
  () => profileUser.value?.display_name || agentProfile.value?.title || null
)
const pageTitle = computed(() => displayName.value ?? 'Agent Profile')
const pageDescription = computed(() =>
  displayName.value
    ? `Inspect ${displayName.value}.`
    : 'Inspect the selected agent profile.'
)

const isSelf = computed(() =>
  Boolean(agentId.value && sessionUser.value?.id === agentId.value)
)

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

useAgentSeo(agentProfile, { id: agentId, displayName })

const devPayload = computed(() => ({
  profile: agentProfile.value,
  user: profileUser.value,
  outcome: outcome.value,
}))
</script>
