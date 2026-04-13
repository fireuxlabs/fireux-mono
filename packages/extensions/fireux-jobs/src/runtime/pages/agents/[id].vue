<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="agentProfile && isAdminUser && agentId"
          icon="i-lucide-shield"
          size="xs"
          color="primary"
          variant="solid"
          :to="`/agents/admin/${agentId}`"
        >
          Admin
        </UButton>
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
      <div v-if="pending" class="py-10 text-sm opacity-70">Loading profile…</div>

      <div v-else-if="!agentProfile" class="space-y-2">
        <MoleculesProfilesAdminCreateCard
          v-if="isAdminUser"
          title="Agent profile not available"
          description="Create an agent profile for this user."
          :button-label="agentConfig.cta || 'Create Agent profile'"
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <div v-else>
          <h1 class="text-lg font-semibold">Profile Not Found</h1>
          <p>The profile you're looking for doesn't exist.</p>
          <NuxtLink to="/agents" class="text-primary hover:underline">← Back</NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-4">
        <ProfilesAgentCardsProfile v-if="agentCard" :card="agentCard" :profile="agentProfile" />

        <DevJson
          v-if="isDev && agentProfile"
          :title="'Agent (Doc)'"
          context="Agent detail page · agents/[id] · core profile doc"
          :data="agentProfile"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'
import { computed, ref } from 'vue'
import { useAgentInterface } from '../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import type { Agent } from '../../models/profiles/Agent/Agent.model'

const route = useRoute()
const agentId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  return String(raw ?? '').trim() || null
})

const { profile, pending } = useProfileFetch<Agent>(agentId, agentConfig)
const agentProfile = computed(() => profile.coreProfile.value ?? null)

const userRefs = useUserFetch(agentId)
const { coreUser, appUser, user: sessionUser } = useUser()
const { pill: agentInterface } = useAgentInterface(profile, userRefs.user)
const agentCard = computed(() => agentInterface(agentProfile.value))

const resolveName = (p: any) =>
  p?.display_name ||
  p?.name ||
  p?.title ||
  p?.agency_name ||
  p?.company_name ||
  p?.business_name ||
  p?.professional_name ||
  'Profile'

useHead({
  title: computed(() =>
    agentProfile.value
      ? `${resolveName(agentProfile.value)} · Agent Profile`
      : 'Agent Profile'
  ),
})

const displayName = computed(() =>
  userRefs.user.value?.display_name || (agentProfile.value ? resolveName(agentProfile.value) : null)
)
const pageTitle = computed(() => displayName.value ?? 'Agent Profile')
const pageDescription = computed(() =>
  displayName.value
    ? `Inspect ${displayName.value}.`
    : 'Inspect the selected agent profile.'
)
const isDev = import.meta.dev

const isSelf = computed(() =>
  Boolean(agentId.value && sessionUser.value?.id === agentId.value)
)

const isAdminUser = computed(() =>
  appUser.value?.role === 'admin' ||
  Boolean(coreUser.value?.adminOf?.length)
)

const { ensure } = useProfileEnsure(agentConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value || !agentId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure(agentId.value)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}
</script>
