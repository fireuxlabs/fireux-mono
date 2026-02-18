<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/ingredients"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="loading" class="py-10 text-sm opacity-70">
        Loading ingredient...
      </div>

      <div v-else-if="!ingredient" class="space-y-2">
        <h1 class="text-lg font-semibold">Ingredient Not Found</h1>
        <p>The ingredient you are looking for does not exist.</p>
        <NuxtLink to="/ingredients" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-if="isAdmin && ingredient" class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-lucide-pencil"
            @click="showAdmin = !showAdmin"
          >
            {{ showAdmin ? 'Hide edit' : 'Edit' }}
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            color="error"
            icon="i-lucide-trash"
            :loading="deleting"
            @click="requestDelete"
          >
            Delete
          </UButton>
        </div>

        <IngredientCardsProfile
          v-if="ingredientProfile"
          :model="ingredientProfile"
        />

        <DevJson
          v-if="isDev && ingredient"
          :title="'Ingredient (Doc)'"
          context="Ingredient detail page · ingredients/[id] · ingredient doc"
          :data="ingredient"
          :default-open="false"
        />

        <UCard v-if="isAdmin && showAdmin">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Admin edit</div>
              <p class="text-xs text-dimmed">Update the ingredient details.</p>
            </div>
          </template>

          <div class="space-y-4">
            <UFormGroup label="Image">
              <div class="flex flex-col items-center gap-2">
                <MoleculesFormsFirestoreImagePicker
                  :src="ingredient?.image_url || ''"
                  :alt="ingredient?.name || 'Ingredient'"
                  :initials="imageInitials"
                  :update-function="handleImageUpload"
                />
                <p v-if="imageUploading" class="text-xs text-gray-500">
                  Uploading image…
                </p>
              </div>
            </UFormGroup>

            <UFormGroup label="Name" required>
              <UInput v-model="form.name" placeholder="Ingredient name" />
            </UFormGroup>

            <div class="flex justify-end gap-2">
              <UButton
                variant="ghost"
                :disabled="saving || !isDirty"
                @click="resetForm"
              >
                Reset
              </UButton>
              <UButton
                color="primary"
                :loading="saving"
                :disabled="!isDirty"
                @click="saveChanges"
              >
                Save changes
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>

</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useIngredient } from '../../composables/fireux/firestore/ingredient/useIngredient'
import type { Ingredient } from '../../models/ingredient.model'

definePageMeta({
  layout: 'default',
  title: 'Ingredient',
  description: 'View a saved ingredient.',
})

const { appName } = useFireUXConfig()
const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { ingredients, profile, deleteIngredient } = useIngredient()
const { isAdmin } = useUser()
const { updateDocument } = useFirestoreUpdate()
const { uploadImage } = useImageStorage()
const toast = useToastify()

const ingredient = computed<Ingredient | null>(() => {
  const list = ingredients.value ?? []
  return list.find((item) => String(item.id) === docId) ?? null
})

const loading = computed(() => ingredients.value === undefined)

const ingredientProfile = computed(() => profile(ingredient.value))

const showAdmin = ref(false)
const saving = ref(false)
const deleting = ref(false)
const imageUploading = ref(false)

const form = reactive<{
  name: string
}>({
  name: '',
})

watchEffect(() => {
  const entry = ingredient.value
  if (!entry) return
  form.name = entry.name ?? ''
})

const isDirty = computed(() => {
  const entry = ingredient.value
  if (!entry) return false
  return form.name.trim() !== String(entry.name ?? '').trim()
})

const resetForm = () => {
  const entry = ingredient.value
  if (!entry) return
  form.name = entry.name ?? ''
}

const imageInitials = computed(() => {
  const rawName = String(ingredient.value?.name || '').trim()
  if (!rawName) return 'I'
  const parts = rawName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
})

const handleImageUpload = async (file: File) => {
  if (!docId) return
  imageUploading.value = true
  try {
    const url = await uploadImage(`ingredients/${docId}/image_url`, file)
    await updateDocument<Ingredient>('ingredients', docId, { image_url: url })
    toast.success('Ingredient image updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update ingredient image'))
    throw error
  } finally {
    imageUploading.value = false
  }
}

const saveChanges = async () => {
  if (!ingredient.value || !docId || !isDirty.value) return
  saving.value = true
  try {
    await updateDocument<Ingredient>('ingredients', docId, {
      name: form.name.trim(),
    })
    toast.success('Ingredient updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update ingredient'))
  } finally {
    saving.value = false
  }
}

const deleteDescription = computed(() => {
  const name = ingredient.value?.name || docId || 'this ingredient'
  return `Delete ${name}? This cannot be undone.`
})

const requestDelete = async () => {
  if (!docId || deleting.value) return
  if (import.meta.client && !window.confirm(deleteDescription.value)) return
  await confirmDelete()
}

const confirmDelete = async () => {
  if (!docId) return
  deleting.value = true
  try {
    await deleteIngredient(docId)
    toast.success('Ingredient deleted')
    await navigateTo('/ingredients')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to delete ingredient'))
  } finally {
    deleting.value = false
  }
}

const pageTitle = computed(() => ingredient.value?.name || 'Ingredient')
const pageDescription = computed(() => 'Ingredient details.')
const isDev = import.meta.dev

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
