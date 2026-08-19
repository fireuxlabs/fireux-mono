<!-- Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: let Nuxt UI own the identity card header. -->
<template>
  <ClientOnly>
    <UPageCard
      v-if="chef"
      title="Identity"
      icon="i-lucide-id-card"
      variant="outline"
    >
      <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Title"
            :firebase-value="title"
            placeholder="Ex: Head Chef"
            :maxlength="60"
            :update-function="handleTitle"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Summary"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="summary"
            placeholder="Short listing summary"
            :update-function="handleSummary"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Bio"
            type="textarea"
            :rows="6"
            :maxlength="2000"
            :firebase-value="bio"
            placeholder="Long-form chef bio"
            :update-function="handleBio"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Chef Image URL"
            :firebase-value="imageUrl"
            placeholder="Optional: image URL for this chef profile"
            :maxlength="400"
            :update-function="handleImage"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Signature Dishes"
            :firebase-value="signatureDishes"
            item-placeholder="Signature dish"
            new-item-placeholder="Add signature dish"
            :update-function="handleSignatureDishes"
          />
      </div>
    </UPageCard>

    <MoleculesStateCard v-else entity="chef profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 17:14 CEST — Repo Efficiency Pass 2 of 6: bind Chef editor only to canonical fields.
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed } from 'vue'
import { useChefUpdate } from '../../../composables/firestore/profiles/Chef/mutations/useChefUpdate'
import { useChef } from '../../../composables/chef/useChef'

const { coreProfile } = useChef()

const chef = computed(() => coreProfile.value ?? null)
const { updateTitle, updateSummary, updateBio, updateImage, updateSignatureDishes } = useChefUpdate()

const toast = useToastify()

const title = computed(() => chef.value?.title ?? '')
const summary = computed(() => chef.value?.summary ?? '')
const bio = computed(() => chef.value?.chef_bio ?? '')
const imageUrl = computed(() => chef.value?.chef_image ?? '')

const signatureDishes = computed(() => {
  const list = chef.value?.chef_signature_dishes ?? []
  return Array.isArray(list) ? list : []
})

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
      color: 'error',
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
  wrap(() => updateImage(value), 'Chef image updated', 'Failed to update chef image')

const handleSignatureDishes = async (value: string[]) =>
  wrap(
    () => updateSignatureDishes(value),
    'Signature dishes updated',
    'Failed to update signature dishes'
  )
</script>
