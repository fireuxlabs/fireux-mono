<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <div class="console-profile">
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

        <div class="console-profile__pills">
          <AgentCardsPill
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
          <div v-if="view === 'profile'" class="console-profile__section">
            <AgentCardsProfile
              v-if="agentCard"
              :card="agentCard"
              :profile="resolvedCoreProfile"
            />
          </div>

          <div v-else class="console-profile__section">
            <AgentEditCore :agent="resolvedCoreProfile" />

            <AgentEditApp
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
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentInterface } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import type { AppAgent, Agent } from '../../../models/profiles/Agent/Agent.model'

definePageMeta({
  layout: 'default',
  visibility: { profiles: ['agent'] },
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

const userRefs = useUserFetch(userId)
const { profile, pending } = useProfileFetch<Agent, AppAgent>(
  userId,
  agentConfig
)
const { coreProfile, appProfile } = profile

const { profile: makeCard } = useAgentInterface(profile, userRefs.user)

const isProfileLoading = computed(
  () => pending.value || coreProfile.value === undefined
)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
const agentCard = computed(() => makeCard(resolvedCoreProfile.value))
const pageTitle = computed(() =>
  agentCard.value?.displayName
    ? `Admin · ${agentCard.value.displayName}`
    : userId.value
      ? `Admin · Agent · ${userId.value}`
      : 'Admin · Agent Profile'
)
const pageDescription = computed(
  () => 'Review the public profile and edit the underlying agent documents.'
)

const { createProfile: createProfileRecord } = useProfileCreate(agentConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value || !userId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await createProfileRecord(userId.value)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}

const { view, viewIcon, toggleView } = useConsoleProfileView()
</script>
