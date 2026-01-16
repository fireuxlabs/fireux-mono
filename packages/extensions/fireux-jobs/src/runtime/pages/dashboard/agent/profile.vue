<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-profile">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="fx-panels-stack">
        <!-- Header pills -->
        <div class="flex flex-wrap items-center gap-2">
          <component
            :is="wrapperFor(appCard)"
            v-if="appCard"
            v-bind="wrapperPropsFor(appCard)"
            class="block"
          >
            <OrganismsAppCardsPill v-bind="appCard" :show-subtitle="false" />
          </component>

          <component
            :is="wrapperFor(userCard)"
            v-if="userCard"
            v-bind="wrapperPropsFor(userCard)"
            class="block"
          >
            <OrganismsUserCardsPill v-bind="userCard" :show-subtitle="false" />
          </component>
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

        <!-- Main panels -->
        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="fx-panels-masonry">
            <template #preview>
              <OrganismsProfilesAgentEditPreviewPanel />
            </template>

            <template #core>
              <OrganismsProfilesAgentEditCore :agent="resolvedCoreProfile" />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesAgentEditApp :agent="resolvedAppProfile" />
            </template>
          </LayoutsDashboardProfileEdit>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useApp } from 'fireux-core/runtime/composables/fireux/firestore/core/app/useApp'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'
import { agentConfig } from '../../../models/profiles/Agent/Agent.model'

const navLabel = agentConfig.navLabel ?? `${agentConfig.profileType} Profile`
const navIcon = agentConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useAgent()
const { app, card: appToCard } = useApp()
const { user, card: userToCard } = useUser()

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

const userCard = computed(() => userToCard(user.value))
const appCard = computed(() => appToCard(app.value))

const wrapperFor = (card: { to?: string | null } | null) => (card?.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: { to?: string | null } | null) => (card?.to ? { to: card.to } : {})
</script>
