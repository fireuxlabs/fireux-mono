<template>
  <section class="console-surface">
    <UPageCard
      v-if="!selectedKitchen"
      title="No kitchen selected"
      description="Select a kitchen before editing its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!canWrite"
      title="Kitchen identity is read-only"
      description="This kitchen cannot be edited in the current console mode."
      variant="subtle"
    />

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Kitchen Identity</div>
        </div>
      </template>

      <div class="space-y-4">
        <MoleculesFormsFirestoreSimpleField
          label="Name"
          :firebase-value="name"
          placeholder="Kitchen name"
          :maxlength="120"
          :update-function="handleName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Short name"
          :firebase-value="shortName"
          placeholder="Short display name"
          :maxlength="80"
          :update-function="handleShortName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Short address"
          :firebase-value="shortAddress"
          placeholder="Short address"
          :maxlength="160"
          :update-function="handleShortAddress"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Formatted address"
          :firebase-value="formattedAddress"
          placeholder="Full formatted address"
          :maxlength="240"
          :update-function="handleFormattedAddress"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Image URL"
          :firebase-value="imageUrl"
          placeholder="Kitchen image URL"
          :maxlength="500"
          :update-function="handleImageUrl"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleIdentity'
import { useKitchenUpdate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { KitchenUpdateInput } from '../../../models/kitchen.model'

const { selectedKitchen, kitchenId, rootCollection, canWrite } =
  useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)

const name = computed(() => String(kitchen.value?.name ?? ''))
const shortName = computed(() => String(kitchen.value?.short_name ?? ''))
const shortAddress = computed(() => String(kitchen.value?.short_address ?? ''))
const formattedAddress = computed(() => String(kitchen.value?.formatted_address ?? ''))
const imageUrl = computed(() => String(kitchen.value?.image_url ?? ''))

const updateIdentityField = async (
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) => {
  if (!canWrite.value) {
    throw new Error('This kitchen is read-only.')
  }

  const id = kitchenId.value
  if (!id) {
    throw new Error('No kitchen selected.')
  }

  if (rootCollection.value !== 'kitchens') {
    throw new Error('Kitchen identity edits are only available for root kitchens.')
  }

  try {
    await updateKitchen(id, patch)
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
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
  updateIdentityField({ name: value }, 'Name updated', 'Failed to update name')

const handleShortName = async (value: string) =>
  updateIdentityField(
    { short_name: value },
    'Short name updated',
    'Failed to update short name'
  )

const handleShortAddress = async (value: string) =>
  updateIdentityField(
    { short_address: value },
    'Short address updated',
    'Failed to update short address'
  )

const handleFormattedAddress = async (value: string) =>
  updateIdentityField(
    { formatted_address: value },
    'Formatted address updated',
    'Failed to update formatted address'
  )

const handleImageUrl = async (value: string) =>
  updateIdentityField(
    { image_url: value },
    'Image URL updated',
    'Failed to update image URL'
  )
</script>
