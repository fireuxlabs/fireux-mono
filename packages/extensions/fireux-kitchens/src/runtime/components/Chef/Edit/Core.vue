<template>
  <ClientOnly>
    <div v-if="chef" class="space-y-6">
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
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="chef profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import { useChefUpdate } from '../../../composables/fireux/firestore/profiles/Chef/mutations/useChefUpdate'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'

const { coreProfile } = useChef()

const chef = computed(() => coreProfile.value ?? null)
const { updateTitle, updateSummary, updateBio, updateImage, updateSignatureDishes } = useChefUpdate()

const toast = useToastify()

const title = computed(() => chef.value?.title ?? '')
const summary = computed(() => chef.value?.summary ?? '')
const bio = computed(() => chef.value?.chef_bio ?? chef.value?.bio_long ?? '')
const imageUrl = computed(() => chef.value?.chef_image ?? '')

const signatureDishes = computed(() => {
  const list =
    chef.value?.chef_signature_dishes?.length
      ? chef.value?.chef_signature_dishes
      : chef.value?.specialties ?? []
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
