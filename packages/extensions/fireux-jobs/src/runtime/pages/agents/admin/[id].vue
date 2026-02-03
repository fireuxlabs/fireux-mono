<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <div class="dashboard-profile">
        <div class="flex justify-end">
          <UButton
            :icon="viewIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            :aria-pressed="view === 'profile'"
            @click="toggleView"
          />
        </div>

        <div class="dashboard-profile__pills">
          <OrganismsProfilesAgentCardsPill
            v-if="agentCard"
            v-bind="agentCard"
            :link="Boolean(agentCard.to)"
            class="block"
          />
        </div>

        <UPageCard v-if="isProfileLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading profile…</p>
        </UPageCard>

        <MoleculesProfilesAdminCreateCard
          v-else-if="!resolvedCoreProfile"
          title="Agent profile not available"
          description="This agent profile hasn’t been created yet."
          :button-label="agentConfig.cta || 'Create Agent profile'"
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="dashboard-profile__section">
            <OrganismsProfilesAgentCardsProfile
              v-if="agentCard"
              :card="agentCard"
            />
          </div>

          <div v-else class="dashboard-profile__section">
            <OrganismsProfilesAgentEditCore :agent="resolvedCoreProfile" />

            <OrganismsProfilesAgentEditApp
              v-if="resolvedAppProfile"
              :agent="resolvedAppProfile"
            />
          </div>
        </ClientOnly>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDashboardProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useDashboardProfileView'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentInterface } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import type { AgentApp, AgentCore } from '../../../models/profiles/Agent/Agent.model'
import { agentConfig } from '../../../models/profiles/Agent/Agent.model'

definePageMeta({
  layout: 'default',
  name: 'AgentsAdminEditPage',
  requiresAuth: true,
})

const route = useRoute()

const userId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const pageTitle = computed(() =>
  userId.value ? `Admin · Agent · ${userId.value}` : 'Admin · Agent'
)
const pageDescription = 'Admin edit agent profile.'

const userRefs = useUserFetch(userId)
const { profile, pending } = useProfileFetch<AgentCore, AgentApp>(
  userId,
  agentConfig
)
const { coreProfile, appProfile } = profile

const { card: makeCard } = useAgentInterface(profile, userRefs.user)

const isProfileLoading = computed(
  () => pending.value || coreProfile.value === undefined
)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
const agentCard = computed(() => makeCard(resolvedCoreProfile.value))

const { ensure } = useProfileEnsure(agentConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value || !userId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure(userId.value)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}

const { view, viewIcon, toggleView } = useDashboardProfileView()
</script>
