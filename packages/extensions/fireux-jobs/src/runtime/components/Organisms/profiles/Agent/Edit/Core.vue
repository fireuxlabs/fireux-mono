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

          <MoleculesFormsFirestoreSimpleField
            label="Contact Email"
            :firebase-value="contactEmail"
            placeholder="Ex: daniel@misebox.app"
            :maxlength="120"
            :update-function="handleContactEmail"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Contact Phone"
            :firebase-value="contactPhone"
            placeholder="Optional"
            :maxlength="60"
            :update-function="handleContactPhone"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Website"
            :firebase-value="websiteUrl"
            placeholder="Ex: https://misebox.app"
            :maxlength="200"
            :update-function="handleWebsiteUrl"
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
const {
  updateAgencyName,
  updateTagline,
  updateBioShort,
  updateContactEmail,
  updateContactPhone,
  updateWebsiteUrl,
} = useAgentUpdate()
const { DisplayName } = useUserFormattingAndValidation()

const toast = useToast()

const agencyName = computed(
  () => agent.value?.title ?? agent.value?.user?.display_name ?? ''
)

const bioShort = computed(() => agent.value?.bio_short ?? '')

const tagline = computed(() => agent.value?.tagline ?? '')

const contactEmail = computed(() => agent.value?.contact_email ?? '')
const contactPhone = computed(() => agent.value?.contact_phone ?? '')
const websiteUrl = computed(() => agent.value?.website_url ?? '')

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

const handleContactEmail = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateContactEmail(value)
    toast?.add({
      title: 'Contact email updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update contact email',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleContactPhone = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateContactPhone(value)
    toast?.add({
      title: 'Contact phone updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update contact phone',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleWebsiteUrl = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateWebsiteUrl(value)
    toast?.add({
      title: 'Website updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update website',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}
</script>
