<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Edit</div>
        <p class="text-xs text-dimmed">Update the ingredient details.</p>
      </div>
    </template>

    <div class="space-y-4">
      <UFormField label="Image">
        <div class="flex flex-col items-center gap-2">
          <MoleculesFormsFirestoreImagePicker
            :src="ingredient.image_url || ''"
            :alt="ingredient.name || 'Ingredient'"
            :initials="imageInitials"
            :update-function="handleImageUpload"
          />
          <p v-if="imageUploading" class="text-xs text-muted">
            Uploading image...
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

      <div class="flex flex-wrap justify-end gap-2">
        <UButton
          variant="ghost"
          :disabled="saving || !isDirty"
          @click="resetForm"
        >
          Reset
        </UButton>
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash"
          :loading="deleting"
          @click="requestDelete"
        >
          Delete
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
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import {
  FIREUX_CORE_LANGUAGE_OPTIONS,
} from 'fireux-translation/runtime/languages'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useIngredient } from '../../composables/fireux/firestore/ingredient/useIngredient'
import type {
  Ingredient,
  IngredientUpdateInput,
} from '../../models/ingredient.model'

// Ingredient edit stays as a simple root edit component until it needs child panels.
// See docs/concepts/components.md for the file-vs-directory component spine.
const props = defineProps<{
  ingredientId: string
  ingredient: Ingredient
}>()

const {
  updateIngredient,
  deleteIngredient,
} = useIngredient()
const { uploadImage } = useImageStorage()
const toast = useToastify()

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
  form.name = props.ingredient.name ?? ''
  form.source_language = normalizeLanguageCode(props.ingredient.source_language) || 'en'

  const names = normalizeNames(props.ingredient.names)
  for (const field of languageNameFields) {
    form.names[field.code] = names[field.code] ?? ''
  }
})

const isDirty = computed(() => {
  const currentNames = normalizeNames(props.ingredient.names)
  const nextNames = buildNamesPatch(props.ingredient)
  const currentSourceLanguage = normalizeLanguageCode(props.ingredient.source_language)
  const nextSourceLanguage = normalizeLanguageCode(form.source_language) || 'en'

  return (
    form.name.trim() !== String(props.ingredient.name ?? '').trim() ||
    currentSourceLanguage !== nextSourceLanguage ||
    serializeNames(currentNames) !== serializeNames(nextNames)
  )
})

const resetForm = () => {
  form.name = props.ingredient.name ?? ''
  form.source_language = normalizeLanguageCode(props.ingredient.source_language) || 'en'

  const names = normalizeNames(props.ingredient.names)
  for (const field of languageNameFields) {
    form.names[field.code] = names[field.code] ?? ''
  }
}

const imageInitials = computed(() => {
  const rawName = String(props.ingredient.name || '').trim()
  if (!rawName) return 'I'
  const parts = rawName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
})

const handleImageUpload = async (file: File) => {
  if (!props.ingredientId) return
  imageUploading.value = true
  try {
    const url = await uploadImage(`ingredients/${props.ingredientId}/image_url`, file)
    await updateIngredient(props.ingredientId, { image_url: url })
    toast.success('Ingredient image updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update ingredient image'))
    throw error
  } finally {
    imageUploading.value = false
  }
}

const saveChanges = async () => {
  if (!props.ingredientId || !isDirty.value) return
  saving.value = true
  try {
    const nextNames = buildNamesPatch(props.ingredient)
    const nextSourceLanguage = normalizeLanguageCode(form.source_language) || 'en'
    const patch: IngredientUpdateInput = {
      ...(form.name.trim() !== String(props.ingredient.name ?? '').trim()
        ? { name: form.name.trim() }
        : {}),
      ...(normalizeLanguageCode(props.ingredient.source_language) !== nextSourceLanguage
        ? { source_language: nextSourceLanguage }
        : {}),
      ...(serializeNames(normalizeNames(props.ingredient.names)) !== serializeNames(nextNames)
        ? { names: nextNames }
        : {}),
    }

    if (!Object.keys(patch).length) return

    await updateIngredient(props.ingredientId, patch)
    toast.success('Ingredient updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update ingredient'))
  } finally {
    saving.value = false
  }
}

const deleteDescription = computed(() => {
  const name = props.ingredient.name || props.ingredientId || 'this ingredient'
  return `Delete ${name}? This cannot be undone.`
})

const requestDelete = async () => {
  if (!props.ingredientId || deleting.value) return
  if (import.meta.client && !window.confirm(deleteDescription.value)) return
  await confirmDelete()
}

const confirmDelete = async () => {
  if (!props.ingredientId) return
  deleting.value = true
  try {
    await deleteIngredient(props.ingredientId)
    toast.success('Ingredient deleted')
    await navigateTo('/ingredients')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to delete ingredient'))
  } finally {
    deleting.value = false
  }
}
</script>
