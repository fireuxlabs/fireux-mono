<template>
  <section class="console-surface">
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
      description="This portfolio cannot be edited in the current console mode."
      variant="subtle"
    />

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Portfolio Identity</div>
        </div>
      </template>

      <div class="space-y-4">
        <MoleculesFormsFirestoreSimpleField
          label="Name"
          :firebase-value="name"
          placeholder="Portfolio name"
          :maxlength="120"
          :update-function="handleName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Tagline"
          :firebase-value="tagline"
          placeholder="Short portfolio tagline"
          :maxlength="120"
          :update-function="handleTagline"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Owner"
          :firebase-value="ownerLabel"
          placeholder="Owner label"
          :maxlength="120"
          :update-function="handleOwnerLabel"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Strategy"
          :firebase-value="strategyLabel"
          placeholder="Strategy label"
          :maxlength="120"
          :update-function="handleStrategyLabel"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Region"
          :firebase-value="regionLabel"
          placeholder="Region label"
          :maxlength="120"
          :update-function="handleRegionLabel"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Notes"
          :firebase-value="notes"
          placeholder="Short portfolio notes"
          :maxlength="240"
          :update-function="handleNotes"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Portfolio: route identity edits through the fixed root mutation.
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { usePortfolioConsoleIdentity } from '../../../../../composables/fireux/console/portfolio/identity/usePortfolioConsoleIdentity'
import { usePortfolioUpdate } from '../../../../../composables/fireux/firestore/portfolio/mutations/usePortfolioUpdate'
import type { PortfolioUpdateInput } from '../../../../../models/portfolio.model'

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
} = usePortfolioConsoleIdentity()
const { updatePortfolio } = usePortfolioUpdate()
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

  try {
    await updatePortfolio(id, patch)
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
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
