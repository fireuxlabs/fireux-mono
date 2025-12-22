<template>
  <ClientOnly>
    <div v-if="agent" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Agency Name"
            :firebase-value="agencyName"
            placeholder="Agency name"
            :maxlength="60"
            :update-function="handleAgencyName"
            :validation-function="DisplayName.validate"
            :formatting-function="DisplayName.format"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Tagline"
            :firebase-value="tagline"
            placeholder="Ex: Agency supporting hospitality talent"
            :update-function="handleTagline"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Short Bio"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="bioShort"
            placeholder="Summarize your organization in a few sentences"
            :update-function="handleBioShort"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="agent profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import type { AgentProfile } from '../../../../../models/profiles/Agent/Agent.model'
import { useAgentUpdate } from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentUpdate'
import { useUserFormattingAndValidation } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/validation/useUserFormatting'

const props = defineProps<{ agent: AgentProfile | null }>()

const agent = computed(() => props.agent ?? null)
const { updateAgencyName, updateTagline, updateBioShort } = useAgentUpdate()
const { DisplayName } = useUserFormattingAndValidation()

const toast = useToast()

const agencyName = computed(
  () => agent.value?.title ?? agent.value?.user?.display_name ?? ''
)

const bioShort = computed(() => agent.value?.user?.bio ?? '')

const tagline = computed(() => agent.value?.tagline ?? '')

const handleAgencyName = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateAgencyName(value)
    toast?.add({
      title: 'Agency name updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update agency name',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleTagline = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateTagline(value)
    toast?.add({
      title: 'Tagline updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update tagline',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleBioShort = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateBioShort(value)
    toast?.add({
      title: 'Short bio updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update short bio',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}
</script>
