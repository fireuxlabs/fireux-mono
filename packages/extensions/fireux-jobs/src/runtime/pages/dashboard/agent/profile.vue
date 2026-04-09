<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue -->
<template>
  <UDashboardPanel id="console-agent-profile">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle">
        <template #right>
          <UButton
            :icon="viewIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            :aria-pressed="view === 'profile'"
            @click="toggleView"
          />
        </template>
      </LayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <div class="console-profile__pills">
          <ProfilesAgentCardsPill
            v-if="agentCard"
            v-bind="agentCard"
            :link="Boolean(agentCard.to)"
            class="block"
          />
        </div>

        <!-- Loading -->
        <UPageCard v-if="isProfileLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading profile…</p>
        </UPageCard>

        <!-- Missing profile -->
        <UPageCard
          v-else-if="!resolvedCoreProfile"
          title="Agent profile not available"
          description="Your agent profile hasn’t been created yet."
          variant="subtle"
        >
          <UButton
            :label="agentConfig.cta || 'Create Agent profile'"
            color="neutral"
            :loading="isCreating"
            @click="createProfile"
          />

          <p v-if="createError" class="mt-3 text-sm text-dimmed">
            {{ createError }}
          </p>
        </UPageCard>

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="console-profile__section">
            <ProfilesAgentCardsProfile
              v-if="agentCard"
              :card="agentCard"
              :profile="resolvedCoreProfile"
            />
          </div>

          <div v-else class="console-profile__section">
            <ProfilesAgentEditCore :agent="resolvedCoreProfile" />

            <ProfilesAgentEditApp
              v-if="resolvedAppProfile"
              :agent="resolvedAppProfile"
            />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'
import { computed, ref } from 'vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const navLabel = agentConfig.navLabel ?? `${agentConfig.profileType} Profile`
const navIcon = agentConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'] },
    key: 'console-agent-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile, interface: agentCardFromProfile } = useAgent()

const { ensure } = useProfileEnsure(agentConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure()
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)

const agentCard = computed(() => agentCardFromProfile(resolvedCoreProfile.value))

const { view, viewIcon, toggleView } = useConsoleProfileView()

</script>
