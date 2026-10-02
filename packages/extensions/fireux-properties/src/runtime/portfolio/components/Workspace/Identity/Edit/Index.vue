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
      <template #header>
        <div class="workspace-card-header">
          <div class="workspace-card-header__title">Portfolio Identity</div>
        </div>
      </template>

      <div class="space-y-4">
        <MoleculesFormsEditableSimpleField
          label="Name"
          :value="name"
          placeholder="Portfolio name"
          :maxlength="120"
          :update="handleName"
        />

        <MoleculesFormsEditableSimpleField
          label="Tagline"
          :value="tagline"
          placeholder="Short portfolio tagline"
          :maxlength="120"
          :update="handleTagline"
        />

        <MoleculesFormsEditableSimpleField
          label="Owner"
          :value="ownerLabel"
          placeholder="Owner label"
          :maxlength="120"
          :update="handleOwnerLabel"
        />

        <MoleculesFormsEditableSimpleField
          label="Strategy"
          :value="strategyLabel"
          placeholder="Strategy label"
          :maxlength="120"
          :update="handleStrategyLabel"
        />

        <MoleculesFormsEditableSimpleField
          label="Region"
          :value="regionLabel"
          placeholder="Region label"
          :maxlength="120"
          :update="handleRegionLabel"
        />

        <MoleculesFormsEditableSimpleField
          label="Notes"
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
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { usePortfolioIdentity } from '../../../../composables/usePortfolioIdentity'
import { usePortfolioUpdate } from '../../../../composables/firestore/mutations/usePortfolioUpdate'
import type { PortfolioUpdateInput } from '../../../../models/portfolio.model.ts'

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
} = usePortfolioIdentity()
const { updatePortfolio, captureIntent } = usePortfolioUpdate()
const toast = useToastify()

const updateIdentityField = async (
  patch: PortfolioUpdateInput,
  successTitle: string,
  failTitle: string
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
    await updatePortfolio({ portfolioId: id, changes: patch })
    if (!isCurrent()) return
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    if (!isCurrent()) return
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

const handleName = async (value: string) =>
  updateIdentityField({ name: value }, 'Name updated', 'Failed to update name')

const handleTagline = async (value: string) =>
  updateIdentityField(
    { tagline: value },
    'Tagline updated',
    'Failed to update tagline'
  )

const handleOwnerLabel = async (value: string) =>
  updateIdentityField(
    { owner_label: value },
    'Owner updated',
    'Failed to update owner'
  )

const handleStrategyLabel = async (value: string) =>
  updateIdentityField(
    { strategy_label: value },
    'Strategy updated',
    'Failed to update strategy'
  )

const handleRegionLabel = async (value: string) =>
  updateIdentityField(
    { region_label: value },
    'Region updated',
    'Failed to update region'
  )

const handleNotes = async (value: string) =>
  updateIdentityField(
    { notes: value },
    'Notes updated',
    'Failed to update notes'
  )
</script>
