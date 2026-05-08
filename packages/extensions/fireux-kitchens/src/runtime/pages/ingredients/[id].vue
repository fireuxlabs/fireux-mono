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
            <UFormField label="Image">
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
            </UFormField>

            <UFormField label="Name" required>
              <UInput v-model="form.name" placeholder="Ingredient name" />
            </UFormField>

            <div class="space-y-3">
              <div>
                <div class="text-sm font-semibold">Language names</div>
                <p class="text-xs text-dimmed">
                  Root ingredient names for menu and recipe translation.
                </p>
              </div>

              <UFormField label="Source language">
                <USelect
                  v-model="form.source_language"
                  :options="sourceLanguageOptions"
                  placeholder="Select source language"
                />
              </UFormField>

              <div class="grid gap-3 sm:grid-cols-2">
                <UFormField
                  v-for="field in languageNameFields"
                  :key="field.code"
                  :label="field.label"
                >
                  <UInput
                    v-model="form.names[field.code]"
                    :placeholder="field.placeholder"
                  />
                </UFormField>
              </div>
            </div>

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
import {
  FIREUX_CORE_LANGUAGE_OPTIONS,
} from 'fireux-translation/runtime/languages'
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

const sourceLanguageOptions = FIREUX_CORE_LANGUAGE_OPTIONS.map((language) => ({
  label: `${language.label} (${language.code})`,
  value: language.code,
}))
const languageNameFields = FIREUX_CORE_LANGUAGE_OPTIONS.map((language) => ({
  code: language.code,
  label: `${language.label} name`,
  placeholder: language.label,
}))

const form = reactive<{
  name: string
  source_language: string
  names: Record<string, string>
}>({
  name: '',
  source_language: 'en',
  names: {},
})

const trimString = (value: unknown) => String(value || '').trim()
const normalizeLanguageCode = (value: unknown) =>
  trimString(value).replace(/_/g, '-')

const normalizeNames = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([language, name]) => [normalizeLanguageCode(language), trimString(name)])
      .filter(([language, name]) => Boolean(language && name))
  )
}
const serializeNames = (value: Record<string, string>) =>
  JSON.stringify(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)))

const buildNamesPatch = (entry: Ingredient): Record<string, string> => {
  const names = normalizeNames(entry.names)

  for (const field of languageNameFields) {
    const value = trimString(form.names[field.code])
    if (value) {
      names[field.code] = value
    } else {
      delete names[field.code]
    }
  }

  return names
}

watchEffect(() => {
  const entry = ingredient.value
  if (!entry) return
  form.name = entry.name ?? ''
  form.source_language = normalizeLanguageCode(entry.source_language) || 'en'

  const names = normalizeNames(entry.names)
  for (const field of languageNameFields) {
    form.names[field.code] = names[field.code] ?? ''
  }
})

const isDirty = computed(() => {
  const entry = ingredient.value
  if (!entry) return false

  const currentNames = normalizeNames(entry.names)
  const nextNames = buildNamesPatch(entry)
  const currentSourceLanguage = normalizeLanguageCode(entry.source_language)
  const nextSourceLanguage = normalizeLanguageCode(form.source_language) || 'en'

  return (
    form.name.trim() !== String(entry.name ?? '').trim() ||
    currentSourceLanguage !== nextSourceLanguage ||
    serializeNames(currentNames) !== serializeNames(nextNames)
  )
})

const resetForm = () => {
  const entry = ingredient.value
  if (!entry) return
  form.name = entry.name ?? ''
  form.source_language = normalizeLanguageCode(entry.source_language) || 'en'

  const names = normalizeNames(entry.names)
  for (const field of languageNameFields) {
    form.names[field.code] = names[field.code] ?? ''
  }
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
    const entry = ingredient.value
    const nextNames = buildNamesPatch(entry)
    const nextSourceLanguage = normalizeLanguageCode(form.source_language) || 'en'
    const patch: Partial<Ingredient> = {}

    if (form.name.trim() !== String(entry.name ?? '').trim()) {
      patch.name = form.name.trim()
    }

    if (normalizeLanguageCode(entry.source_language) !== nextSourceLanguage) {
      patch.source_language = nextSourceLanguage
    }

    if (serializeNames(normalizeNames(entry.names)) !== serializeNames(nextNames)) {
      patch.names = nextNames
    }

    if (!Object.keys(patch).length) return

    await updateDocument<Ingredient>('ingredients', docId, patch)
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
