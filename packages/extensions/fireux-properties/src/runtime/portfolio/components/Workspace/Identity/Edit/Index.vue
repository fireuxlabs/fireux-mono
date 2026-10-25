<template>
  <section class="workspace-surface">
    <UPageCard
      v-if="!portfolioId"
      title="No portfolio selected"
      description="Select a portfolio before editing its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedPortfolio"
      title="Loading portfolio identity"
      description="Restoring the selected portfolio."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!canWrite"
      title="Portfolio identity is read-only"
      description="This portfolio cannot be edited in the current workspace mode."
      variant="subtle"
    />

    <UCard v-else :key="portfolioId">
      <div class="space-y-4">
        <FireFormsEditableSimpleField
          :capture-intent="captureIntent"
          v-if="section === 'profile'"
          label="Name"
          :value="name"
          placeholder="Portfolio name"
          :maxlength="120"
          :update="handleName"
        />

        <FireFormsEditableSimpleField
          :capture-intent="captureIntent"
          v-if="section === 'profile'"
          label="Tagline"
          :value="tagline"
          placeholder="Short portfolio tagline"
          :maxlength="120"
          :update="handleTagline"
        />

        <FireFormsEditableSimpleField
          :capture-intent="captureIntent"
          v-if="section === 'context'"
          label="Owner label"
          :value="ownerLabel"
          placeholder="Owner label"
          :maxlength="120"
          :update="handleOwnerLabel"
        />

        <FireFormsEditableSimpleField
          :capture-intent="captureIntent"
          v-if="section === 'context'"
          label="Strategy"
          :value="strategyLabel"
          placeholder="Strategy label"
          :maxlength="120"
          :update="handleStrategyLabel"
        />

        <FireFormsEditableSimpleField
          :capture-intent="captureIntent"
          v-if="section === 'profile'"
          label="Region"
          :value="regionLabel"
          placeholder="Region label"
          :maxlength="120"
          :update="handleRegionLabel"
        />

        <FireFormsEditableSimpleField
          :capture-intent="captureIntent"
          v-if="section === 'context'"
          label="Notes"
          type="textarea"
          :rows="3"
          :value="notes"
          placeholder="Short portfolio notes"
          :maxlength="240"
          :update="handleNotes"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Portfolio: route identity edits through the fixed root mutation.
import { useRoute } from '#imports'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type { PortfolioWorkspaceIdentityState } from '../../../../composables/workspace/usePortfolioWorkspaceIdentity'
import { usePortfolioUpdate } from '../../../../composables/firestore/mutations/usePortfolioUpdate'
import type { PortfolioUpdateInput } from '../../../../models/portfolio.model.ts'

const props = defineProps<{
  identity: PortfolioWorkspaceIdentityState
  section: 'profile' | 'context'
}>()
const {
  selectedPortfolio,
  portfolioId,
  canWrite,
  name,
  tagline,
  notes,
  ownerLabel,
  strategyLabel,
  regionLabel,
} = props.identity
const { updatePortfolio, captureIntent: captureCommand } = usePortfolioUpdate()
const route = useRoute()
const captureSurface = useCommandScope([
  portfolioId,
  canWrite,
  () => route.fullPath,
])
const captureIntent = () => {
  const command = captureCommand(),
    surface = captureSurface()
  return () => command() && surface()
}
const toast = useToastify()

const updateIdentityField = async (
  patch: PortfolioUpdateInput['identity'],
  successTitle: string,
  failTitle: string,
  isSurfaceCurrent: () => boolean = () => true
) => {
  if (!canWrite.value) {
    throw new Error('This portfolio is read-only.')
  }

  const id = portfolioId.value
  if (!id) {
    throw new Error('No portfolio selected.')
  }

  const isCurrent = captureIntent()
  try {
    await updatePortfolio({ portfolioId: id, changes: { identity: patch } })
    if (!isCurrent() || !isSurfaceCurrent()) return
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    if (!isCurrent() || !isSurfaceCurrent()) return
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

const handleName = async (value: string, isSurfaceCurrent?: () => boolean) =>
  updateIdentityField(
    { name: value },
    'Name updated',
    'Failed to update name',
    isSurfaceCurrent
  )

const handleTagline = async (value: string, isSurfaceCurrent?: () => boolean) =>
  updateIdentityField(
    { tagline: value },
    'Tagline updated',
    'Failed to update tagline',
    isSurfaceCurrent
  )

const handleOwnerLabel = async (
  value: string,
  isSurfaceCurrent?: () => boolean
) =>
  updateIdentityField(
    { owner_label: value },
    'Owner updated',
    'Failed to update owner',
    isSurfaceCurrent
  )

const handleStrategyLabel = async (
  value: string,
  isSurfaceCurrent?: () => boolean
) =>
  updateIdentityField(
    { strategy_label: value },
    'Strategy updated',
    'Failed to update strategy',
    isSurfaceCurrent
  )

const handleRegionLabel = async (
  value: string,
  isSurfaceCurrent?: () => boolean
) =>
  updateIdentityField(
    { region_label: value },
    'Region updated',
    'Failed to update region',
    isSurfaceCurrent
  )

const handleNotes = async (value: string, isSurfaceCurrent?: () => boolean) =>
  updateIdentityField(
    { notes: value },
    'Notes updated',
    'Failed to update notes',
    isSurfaceCurrent
  )
</script>
