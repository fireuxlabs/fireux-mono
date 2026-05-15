<template>
  <section class="console-profile__section">
    <div class="console-profile__pills">
      <ProfilesAgentCardsPill
        v-if="agentCard"
        v-bind="agentCard"
        :link="Boolean(agentCard.to)"
        class="block"
      />
    </div>

    <UPageCard v-if="isProfileLoading" variant="subtle">
      <p class="text-sm text-dimmed">Loading profile…</p>
    </UPageCard>

    <UPageCard
      v-else-if="!resolvedCoreProfile"
      title="Agent profile not available"
      description="Your agent profile has not been created yet."
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
      <ProfilesAgentCardsProfile
        v-if="agentCard"
        :card="agentCard"
        :profile="resolvedCoreProfile"
      />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'
import { computed, ref } from 'vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const { coreProfile, profile: agentCardFromProfile } = useAgent()
const { ensure } = useProfileEnsure(agentConfig)

const isCreating = ref(false)
const createError = ref<string | null>(null)

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const agentCard = computed(() => agentCardFromProfile(resolvedCoreProfile.value))

const createProfile = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  try {
    const result = await ensure()
    if (result.coreProfile) {
      coreProfile.value = result.coreProfile as any
    }
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}
</script>
