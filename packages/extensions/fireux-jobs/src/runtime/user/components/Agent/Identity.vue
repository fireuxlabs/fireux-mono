<template>
  <section class="workspace-profile__section">
    <div class="workspace-profile__pills">
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

    <UPageCard
      v-else-if="!resolvedProfile"
      title="Hiring profile not available"
      description="Your hiring profile has not been created yet."
      variant="subtle"
    >
      <UButton
        :label="agentConfig.cta || 'Create hiring profile'"
        color="neutral"
        :loading="isCreating"
        @click="createProfile"
      />

      <p v-if="createError" class="mt-3 text-sm text-dimmed">
        {{ createError }}
      </p>
    </UPageCard>

    <ClientOnly v-else>
      <AgentCardsProfile
        v-if="agentCard"
        :card="agentCard"
        :profile="resolvedProfile"
      />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { agentConfig } from '../../composables/profiles/Agent/config/agentConfig'
import { computed, ref, watch } from 'vue'
import { useAgent } from '../../composables/profiles/Agent/useAgent'

const { agentProfile, profile: agentCardFromProfile } = useAgent()
const { createProfile: createProfileRecord, captureIntent, scopeEpoch } = useProfileCreate(agentConfig)

const isCreating = ref(false)
const createError = ref<string | null>(null)
watch(scopeEpoch, () => { isCreating.value = false; createError.value = null }, { flush: 'sync' })

const isProfileLoading = computed(() => agentProfile.value === undefined)
const resolvedProfile = computed(() => agentProfile.value ?? null)
const agentCard = computed(() =>
  agentCardFromProfile(resolvedProfile.value)
)

const createProfile = async () => {
  if (isCreating.value) return

  const isCurrent = captureIntent()
  isCreating.value = true
  createError.value = null

  try {
    await createProfileRecord()
  } catch (error) {
    if (isCurrent()) createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    if (isCurrent()) isCreating.value = false
  }
}
</script>
