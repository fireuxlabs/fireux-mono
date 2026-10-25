<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: public Agent contacts and Professional summary cleanup. -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: remove product-specific profile examples. -->
<!-- Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: let Nuxt UI own the identity card header. -->
<template>
  <ClientOnly>
    <UPageCard
      v-if="agent"
      title="Identity"
      icon="i-lucide-id-card"
      variant="outline"
    >
      <div class="space-y-4">
        <FireFormsEditableSimpleField
          label="Title"
          :value="title"
          placeholder="Ex: Hospitality hiring team"
          :maxlength="60"
          :update="handleTitle"
          :validation-function="DisplayName.validate"
          :formatting-function="DisplayName.format"
        />

        <FireFormsEditableSimpleField
          label="Summary"
          type="textarea"
          :rows="3"
          :maxlength="200"
          :value="summary"
          placeholder="One short paragraph for listings"
          :update="handleSummary"
        />

        <FireFormsEditableSimpleField
          label="Bio"
          type="textarea"
          :rows="6"
          :maxlength="2000"
          :value="bio"
          placeholder="Long-form hiring profile bio"
          :update="handleBio"
        />

        <FireFormsEditableSimpleField
          label="Hiring Profile Image URL"
          :value="imageUrl"
          placeholder="Optional: image URL for this hiring profile"
          :maxlength="400"
          :update="handleImage"
        />

        <FireFormsEditableArrayOfStrings
          label="Placement Types"
          :value="placementTypes"
          item-placeholder="Placement type"
          new-item-placeholder="Add placement type"
          :update="handlePlacementTypes"
        />

        <FireFormsEditableArrayOfStrings
          label="Tags"
          :value="tags"
          item-placeholder="Tag"
          new-item-placeholder="Add tag"
          :update="handleTags"
        />

        <FireFormsEditableArrayOfStrings
          label="Coverage Areas"
          :value="coverageAreas"
          item-placeholder="Coverage area"
          new-item-placeholder="Add coverage area"
          :update="handleCoverageAreas"
        />

        <FireFormsEditableSimpleField
          label="Public Business Email"
          :value="contactEmail"
          placeholder="Ex: hello@example.com"
          :maxlength="120"
          :update="handleContactEmail"
        />

        <FireFormsEditableSimpleField
          label="Public Business Phone"
          :value="contactPhone"
          placeholder="Optional"
          :maxlength="40"
          :update="handleContactPhone"
        />

        <FireFormsEditableSimpleField
          label="Public Business Website"
          :value="websiteUrl"
          placeholder="Ex: https://example.com"
          :maxlength="200"
          :update="handleWebsiteUrl"
        />
      </div>
    </UPageCard>

    <FireStateCard
      v-else
      entity="hiring profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 17:34 CEST — Repo Efficiency Pass 2 of 6: bind canonical Agent fields and align phone input with the stored contract.
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { USER_DISPLAY_NAME_FIELD as DisplayName } from 'fireux-core/runtime/user/utils/user-formatting'
import { computed } from 'vue'
import { useAgentUpdate } from '../../../composables/profiles/Agent/mutations/useAgentUpdate'
import { useAgent } from '../../../composables/profiles/Agent/useAgent'

const { agentProfile } = useAgent()

const agent = computed(() => agentProfile.value ?? null)

const {
  updateTitle,
  updateSummary,
  updateBio,
  updateImage,
  updatePlacementTypes,
  updateTags,
  updateCoverageAreas,
  updateContactEmail,
  updateContactPhone,
  updateWebsiteUrl,
} = useAgentUpdate()

const toast = useToastify()

const title = computed(() => agent.value?.title ?? '')
const summary = computed(() => agent.value?.summary ?? '')
const bio = computed(() => agent.value?.agent_bio ?? '')
const imageUrl = computed(() => agent.value?.agent_image ?? '')

const placementTypes = computed(() => {
  const list = agent.value?.agent_placement_types ?? []
  return Array.isArray(list) ? list : []
})

const tags = computed(() =>
  Array.isArray(agent.value?.tags) ? agent.value.tags : []
)

const coverageAreas = computed(() =>
  Array.isArray(agent.value?.agent_coverage_areas)
    ? agent.value?.agent_coverage_areas
    : []
)

const contactEmail = computed(() => agent.value?.agent_contact_email ?? '')
const contactPhone = computed(() => agent.value?.agent_contact_phone ?? '')
const websiteUrl = computed(() => agent.value?.agent_website_url ?? '')

const wrap = async (
  fn: () => Promise<void>,
  okTitle: string,
  failTitle: string
) => {
  try {
    await fn()
    toast.add({ title: okTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
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
  wrap(
    () => updateSummary(value),
    'Summary updated',
    'Failed to update summary'
  )

const handleBio = async (value: string) =>
  wrap(() => updateBio(value), 'Bio updated', 'Failed to update bio')

const handleImage = async (value: string) =>
  wrap(
    () => updateImage(value),
    'Hiring profile image updated',
    'Failed to update hiring profile image'
  )

const handlePlacementTypes = async (value: string[]) =>
  wrap(
    () => updatePlacementTypes(value),
    'Placement types updated',
    'Failed to update placement types'
  )

const handleTags = async (value: string[]) =>
  wrap(() => updateTags(value), 'Tags updated', 'Failed to update tags')

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
  wrap(
    () => updateWebsiteUrl(value),
    'Website updated',
    'Failed to update website'
  )
</script>
