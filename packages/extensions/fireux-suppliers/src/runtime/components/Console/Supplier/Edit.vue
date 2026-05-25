<template>
  <section class="console-surface">
    <UPageCard
      v-if="!selectedSupplier"
      title="No supplier selected"
      description="Select a supplier before editing its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!canWrite"
      title="Supplier identity is read-only"
      description="This supplier cannot be edited in the current console mode."
      variant="subtle"
    />

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Supplier Identity</div>
        </div>
      </template>

      <div class="space-y-4">
        <MoleculesFormsFirestoreSimpleField
          label="Organization name"
          :firebase-value="name"
          placeholder="Supplier organization name"
          :maxlength="120"
          :update-function="handleName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Tagline"
          :firebase-value="tagline"
          placeholder="Short supplier tagline"
          :maxlength="120"
          :update-function="handleTagline"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Headline"
          :firebase-value="headline"
          placeholder="Supplier headline"
          :maxlength="160"
          :update-function="handleHeadline"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Summary"
          type="textarea"
          :rows="3"
          :firebase-value="summary"
          placeholder="Short supplier summary"
          :maxlength="300"
          :update-function="handleSummary"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useSupplierConsoleIdentity } from '../../../composables/fireux/console/supplier/operations/useSupplierConsoleIdentity'
import { useSupplierUpdate } from '../../../composables/fireux/firestore/supplier/mutations/useSupplierUpdate'

const {
  selectedSupplier,
  selectedMode,
  supplierId,
  canWrite,
  name,
  tagline,
  headline,
  summary,
} = useSupplierConsoleIdentity()
const {
  updateOrganizationName,
  updateTagline,
  updateHeadline,
  updateSummary,
} = useSupplierUpdate(null, { mode: selectedMode.value })
const toast = useToastify()

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
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  wrap(
    () => updateOrganizationName(value, { id: supplierId.value, mode: selectedMode.value }),
    'Organization name updated',
    'Failed to update organization name'
  )

const handleTagline = async (value: string) =>
  wrap(
    () => updateTagline(value, { id: supplierId.value, mode: selectedMode.value }),
    'Tagline updated',
    'Failed to update tagline'
  )

const handleHeadline = async (value: string) =>
  wrap(
    () => updateHeadline(value, { id: supplierId.value, mode: selectedMode.value }),
    'Headline updated',
    'Failed to update headline'
  )

const handleSummary = async (value: string) =>
  wrap(
    () => updateSummary(value, { id: supplierId.value, mode: selectedMode.value }),
    'Summary updated',
    'Failed to update summary'
  )
</script>
