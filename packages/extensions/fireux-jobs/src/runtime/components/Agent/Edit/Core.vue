<template>
  <ClientOnly>
    <div v-if="agent" class="space-y-6">
      <UCard>
        <template #header>
          <div class="profile-edit__section-header">
            <UIcon name="i-lucide-id-card" />
            Identity
          </div>
        </template>

        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Title"
            :firebase-value="title"
            placeholder="Ex: Hospitality Agent"
            :maxlength="60"
            :update-function="handleTitle"
            :validation-function="DisplayName.validate"
            :formatting-function="DisplayName.format"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Summary"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="summary"
            placeholder="One short paragraph for listings"
            :update-function="handleSummary"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Bio"
            type="textarea"
            :rows="6"
            :maxlength="2000"
            :firebase-value="bio"
            placeholder="Long-form agent bio"
            :update-function="handleBio"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Agent Image URL"
            :firebase-value="imageUrl"
            placeholder="Optional: image URL for this agent profile"
            :maxlength="400"
            :update-function="handleImage"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Placement Types"
            :firebase-value="placementTypes"
            item-placeholder="Placement type"
            new-item-placeholder="Add placement type"
            :update-function="handlePlacementTypes"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Coverage Areas"
            :firebase-value="coverageAreas"
            item-placeholder="Coverage area"
            new-item-placeholder="Add coverage area"
            :update-function="handleCoverageAreas"
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
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUserFormattingAndValidation } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/validation/useUserFormatting'
import { computed } from 'vue'
import { useAgentUpdate } from '../../../composables/fireux/firestore/profiles/Agent/mutations/useAgentUpdate'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const { coreProfile } = useAgent()

const agent = computed(() => coreProfile.value ?? null)

const {
  updateTitle,
  updateSummary,
  updateBio,
  updateImage,
  updatePlacementTypes,
  updateCoverageAreas,
  updateContactEmail,
  updateContactPhone,
  updateWebsiteUrl,
} = useAgentUpdate()

const { DisplayName } = useUserFormattingAndValidation()
const toast = useToastify()

const title = computed(() => agent.value?.title ?? '')
const summary = computed(() => agent.value?.summary ?? '')
const bio = computed(() => agent.value?.agent_bio ?? '')
const imageUrl = computed(() => agent.value?.agent_image ?? '')

const placementTypes = computed(() => {
  const list =
    agent.value?.agent_placement_types?.length
      ? agent.value?.agent_placement_types
      : (agent.value as any)?.tags ?? []
  return Array.isArray(list) ? list : []
})

const coverageAreas = computed(() =>
  Array.isArray(agent.value?.agent_coverage_areas)
    ? agent.value?.agent_coverage_areas
    : []
)

const contactEmail = computed(
  () => agent.value?.agent_contact_email ?? agent.value?.contact_email ?? ''
)
const contactPhone = computed(
  () => agent.value?.agent_contact_phone ?? agent.value?.contact_phone ?? ''
)
const websiteUrl = computed(
  () => agent.value?.agent_website_url ?? agent.value?.website_url ?? ''
)

const wrap = async (fn: () => Promise<void>, okTitle: string, failTitle: string) => {
  try {
    await fn()
    toast.add({ title: okTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleTitle = async (value: string) =>
  wrap(() => updateTitle(value), 'Title updated', 'Failed to update title')

const handleSummary = async (value: string) =>
  wrap(() => updateSummary(value), 'Summary updated', 'Failed to update summary')

const handleBio = async (value: string) =>
  wrap(() => updateBio(value), 'Bio updated', 'Failed to update bio')

const handleImage = async (value: string) =>
  wrap(() => updateImage(value), 'Agent image updated', 'Failed to update agent image')

const handlePlacementTypes = async (value: string[]) =>
  wrap(
    () => updatePlacementTypes(value),
    'Placement types updated',
    'Failed to update placement types'
  )

const handleCoverageAreas = async (value: string[]) =>
  wrap(
    () => updateCoverageAreas(value),
    'Coverage areas updated',
    'Failed to update coverage areas'
  )

const handleContactEmail = async (value: string) =>
  wrap(
    () => updateContactEmail(value),
    'Contact email updated',
    'Failed to update contact email'
  )

const handleContactPhone = async (value: string) =>
  wrap(
    () => updateContactPhone(value),
    'Contact phone updated',
    'Failed to update contact phone'
  )

const handleWebsiteUrl = async (value: string) =>
  wrap(() => updateWebsiteUrl(value), 'Website updated', 'Failed to update website')
</script>
